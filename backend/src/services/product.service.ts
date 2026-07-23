import { Prisma, ProductStatus, Role, ShopStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../lib/errors";
import { serializeProduct } from "../lib/serializers";
import { slugify } from "../lib/slug";
import {
  createProductSchema,
  productQuerySchema,
  updateProductSchema
} from "../validators/product.validators";
import type { z } from "zod";

type ProductQuery = z.infer<typeof productQuerySchema>;
type CreateProductInput = z.infer<typeof createProductSchema>;
type UpdateProductInput = z.infer<typeof updateProductSchema>;

const productInclude = {
  images: {
    orderBy: {
      sortOrder: "asc"
    }
  },
  category: true,
  shop: true
} satisfies Prisma.ProductInclude;

const createUniqueProductSlug = async (name: string, currentProductId?: string) => {
  const baseSlug = slugify(name);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug: candidate }
    });

    if (!existingProduct || existingProduct.id === currentProductId) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
};

const assertProductOwner = async (productId: string, userId: string, role: Role) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      shop: true
    }
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (role !== "ADMIN" && product.shop.ownerId !== userId) {
    throw new ApiError(403, "You cannot manage this product");
  }

  return product;
};

export const productService = {
  async list(query: ProductQuery) {
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.PUBLISHED,
      shop: {
        status: ShopStatus.APPROVED
      }
    };

    if (query.search) {
      where.OR = [
        {
          name: {
            contains: query.search,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: query.search,
            mode: "insensitive"
          }
        }
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.shopId) {
      where.shopId = query.shopId;
    }

    if (typeof query.minPrice === "number" || typeof query.maxPrice === "number") {
      where.priceInCents = {};
      if (typeof query.minPrice === "number") {
        where.priceInCents.gte = Math.round(query.minPrice * 100);
      }
      if (typeof query.maxPrice === "number") {
        where.priceInCents.lte = Math.round(query.maxPrice * 100);
      }
    }

    if (typeof query.featured === "boolean") {
      where.isFeatured = query.featured;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      prisma.product.count({ where })
    ]);

    return {
      items: products.map(serializeProduct),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit))
      }
    };
  },

  async listMine(userId: string) {
    const products = await prisma.product.findMany({
      where: {
        shop: {
          ownerId: userId
        }
      },
      include: productInclude,
      orderBy: {
        createdAt: "desc"
      }
    });

    return products.map(serializeProduct);
  },

  async getById(productId: string, userId?: string, role?: Role) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: productInclude
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const canViewHiddenProduct =
      role === "ADMIN" || (userId && product.shop.ownerId === userId);

    if (!canViewHiddenProduct) {
      if (product.status !== ProductStatus.PUBLISHED || product.shop.status !== ShopStatus.APPROVED) {
        throw new ApiError(404, "Product not found");
      }
    }

    return serializeProduct(product);
  },

  async create(userId: string, input: CreateProductInput) {
    const [shop, category] = await Promise.all([
      prisma.shop.findUnique({
        where: { ownerId: userId }
      }),
      prisma.category.findUnique({
        where: { id: input.categoryId }
      })
    ]);

    if (!shop) {
      throw new ApiError(404, "You need to create a shop before adding products");
    }

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        categoryId: input.categoryId,
        name: input.name,
        slug: await createUniqueProductSlug(input.name),
        description: input.description,
        sku: input.sku || null,
        priceInCents: Math.round(input.price * 100),
        stock: input.stock,
        isFeatured: input.isFeatured,
        status: shop.status === ShopStatus.APPROVED ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
        images: {
          create: input.imageUrls.map((url, index) => ({
            url,
            alt: input.name,
            sortOrder: index
          }))
        }
      },
      include: productInclude
    });

    return serializeProduct(product);
  },

  async update(userId: string, role: Role, productId: string, input: UpdateProductInput) {
    const currentProduct = await assertProductOwner(productId, userId, role);

    if (input.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId }
      });

      if (!category) {
        throw new ApiError(404, "Category not found");
      }
    }

    const updatedProduct = await prisma.$transaction(async (transaction) => {
      if (input.imageUrls) {
        await transaction.productImage.deleteMany({
          where: { productId }
        });
      }

      return transaction.product.update({
        where: { id: productId },
        data: {
          name: input.name,
          description: input.description,
          sku: input.sku,
          categoryId: input.categoryId,
          priceInCents: typeof input.price === "number" ? Math.round(input.price * 100) : undefined,
          stock: input.stock,
          isFeatured: input.isFeatured,
          slug: input.name
            ? await createUniqueProductSlug(input.name, currentProduct.id)
            : currentProduct.slug,
          images: input.imageUrls
            ? {
                create: input.imageUrls.map((url, index) => ({
                  url,
                  alt: input.name || currentProduct.name,
                  sortOrder: index
                }))
              }
            : undefined
        },
        include: productInclude
      });
    });

    return serializeProduct(updatedProduct);
  },

  async remove(userId: string, role: Role, productId: string) {
    await assertProductOwner(productId, userId, role);

    await prisma.product.delete({
      where: { id: productId }
    });

    return { deleted: true };
  }
};
