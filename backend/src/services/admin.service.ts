import { prisma } from "../config/prisma";
import { ApiError } from "../lib/errors";
import { serializeProduct, serializeShop, serializeUser } from "../lib/serializers";
import {
  updateProductStatusSchema,
  updateShopStatusSchema
} from "../validators/admin.validators";
import type { z } from "zod";

type UpdateShopStatusInput = z.infer<typeof updateShopStatusSchema>;
type UpdateProductStatusInput = z.infer<typeof updateProductStatusSchema>;

export const adminService = {
  async dashboard() {
    const [userCount, shopCount, productCount, orderCount] = await Promise.all([
      prisma.user.count(),
      prisma.shop.count(),
      prisma.product.count(),
      prisma.order.count()
    ]);

    return {
      userCount,
      shopCount,
      productCount,
      orderCount
    };
  },

  async listShops() {
    const shops = await prisma.shop.findMany({
      include: {
        owner: true,
        products: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return shops.map((shop) => ({
      ...serializeShop(shop),
      owner: serializeUser(shop.owner),
      productCount: shop.products.length
    }));
  },

  async updateShopStatus(shopId: string, input: UpdateShopStatusInput) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    });

    if (!shop) {
      throw new ApiError(404, "Shop not found");
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        status: input.status
      },
      include: {
        owner: true,
        products: true
      }
    });

    return {
      ...serializeShop(updatedShop),
      owner: serializeUser(updatedShop.owner),
      productCount: updatedShop.products.length
    };
  },

  async listProducts() {
    const products = await prisma.product.findMany({
      include: {
        images: {
          orderBy: {
            sortOrder: "asc"
          }
        },
        category: true,
        shop: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return products.map(serializeProduct);
  },

  async updateProductStatus(productId: string, input: UpdateProductStatusInput) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        status: input.status
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc"
          }
        },
        category: true,
        shop: true
      }
    });

    return serializeProduct(updatedProduct);
  }
};
