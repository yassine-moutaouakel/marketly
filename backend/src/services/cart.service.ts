import { ProductStatus, ShopStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../lib/errors";
import { serializeCart } from "../lib/serializers";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cart.validators";
import type { z } from "zod";

type AddCartItemInput = z.infer<typeof addCartItemSchema>;
type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: {
            orderBy: {
              sortOrder: "asc"
            }
          },
          category: true,
          shop: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  }
} as const;

const getOrCreateCart = async (userId: string) =>
  prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: cartInclude
  });

export const cartService = {
  async get(userId: string) {
    const cart = await getOrCreateCart(userId);
    return serializeCart(cart);
  },

  async addItem(userId: string, input: AddCartItemInput) {
    const [cart, product] = await Promise.all([
      getOrCreateCart(userId),
      prisma.product.findUnique({
        where: { id: input.productId },
        include: {
          shop: true
        }
      })
    ]);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (product.status !== ProductStatus.PUBLISHED || product.shop.status !== ShopStatus.APPROVED) {
      throw new ApiError(400, "This product is not available for purchase");
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: input.productId
        }
      }
    });

    const nextQuantity = (existingItem?.quantity || 0) + input.quantity;

    if (nextQuantity > product.stock) {
      throw new ApiError(400, "Requested quantity exceeds available stock");
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: input.productId
        }
      },
      create: {
        cartId: cart.id,
        productId: input.productId,
        quantity: input.quantity
      },
      update: {
        quantity: nextQuantity
      }
    });

    const freshCart = await prisma.cart.findUnique({
      where: {
        id: cart.id
      },
      include: cartInclude
    });

    return serializeCart(freshCart);
  },

  async updateItem(userId: string, productId: string, input: UpdateCartItemInput) {
    const cart = await getOrCreateCart(userId);
    const item = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    });

    if (!item) {
      throw new ApiError(404, "Cart item not found");
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId
      }
    });

    if (!product || input.quantity > product.stock) {
      throw new ApiError(400, "Requested quantity exceeds available stock");
    }

    await prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      },
      data: {
        quantity: input.quantity
      }
    });

    const freshCart = await prisma.cart.findUnique({
      where: {
        id: cart.id
      },
      include: cartInclude
    });

    return serializeCart(freshCart);
  },

  async removeItem(userId: string, productId: string) {
    const cart = await getOrCreateCart(userId);

    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    });

    const freshCart = await prisma.cart.findUnique({
      where: {
        id: cart.id
      },
      include: cartInclude
    });

    return serializeCart(freshCart);
  }
};
