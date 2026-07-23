import type { OrderStatus, PaymentStatus, Role } from "@prisma/client";
import { ProductStatus, ShopStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../lib/errors";
import { serializeOrder } from "../lib/serializers";
import { checkoutSchema, updateOrderStatusSchema } from "../validators/order.validators";
import type { z } from "zod";

type CheckoutInput = z.infer<typeof checkoutSchema>;
type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

const orderInclude = {
  items: true,
  shop: true,
  buyer: true
} as const;

export const orderService = {
  async checkout(userId: string, input: CheckoutInput) {
    const [user, cart] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          addresses: true
        }
      }),
      prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  shop: true,
                  images: {
                    orderBy: {
                      sortOrder: "asc"
                    }
                  }
                }
              }
            }
          }
        }
      })
    ]);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Your cart is empty");
    }

    const address = user.addresses.find((item) => item.id === input.addressId);

    if (!address) {
      throw new ApiError(404, "Shipping address not found");
    }

    const groupedItems = new Map<
      string,
      typeof cart.items
    >();

    for (const item of cart.items) {
      if (
        item.product.status !== ProductStatus.PUBLISHED ||
        item.product.shop.status !== ShopStatus.APPROVED
      ) {
        throw new ApiError(400, `Product ${item.product.name} is no longer available`);
      }

      if (item.quantity > item.product.stock) {
        throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
      }

      const existingItems = groupedItems.get(item.product.shopId) || [];
      groupedItems.set(item.product.shopId, [...existingItems, item]);
    }

    const shippingSnapshot = {
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country
    };

    const createdOrders = await prisma.$transaction(async (transaction) => {
      const orders = [];

      for (const [shopId, items] of groupedItems.entries()) {
        const totalInCents = items.reduce(
          (sum, item) => sum + item.product.priceInCents * item.quantity,
          0
        );

        const order = await transaction.order.create({
          data: {
            buyerId: userId,
            shopId,
            totalInCents,
            shippingSnapshot,
            notes: input.notes || null,
            items: {
              create: items.map((item) => ({
                productId: item.product.id,
                nameSnapshot: item.product.name,
                skuSnapshot: item.product.sku,
                imageUrlSnapshot: item.product.images[0]?.url || null,
                priceInCents: item.product.priceInCents,
                quantity: item.quantity
              }))
            }
          },
          include: orderInclude
        });

        for (const item of items) {
          // Guarded decrement: the WHERE clause enforces stock >= quantity at
          // database level, which protects against concurrent checkouts that
          // would otherwise drive the stock below zero (race condition).
          const stockUpdate = await transaction.product.updateMany({
            where: {
              id: item.product.id,
              stock: {
                gte: item.quantity
              }
            },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });

          if (stockUpdate.count === 0) {
            throw new ApiError(409, `Insufficient stock for product "${item.product.name}"`);
          }
        }

        orders.push(order);
      }

      await transaction.cartItem.deleteMany({
        where: {
          cartId: cart.id
        }
      });

      return orders;
    });

    return createdOrders.map(serializeOrder);
  },

  async listMine(userId: string) {
    const orders = await prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        items: true,
        shop: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return orders.map(serializeOrder);
  },

  async listReceived(userId: string) {
    const orders = await prisma.order.findMany({
      where: {
        shop: {
          ownerId: userId
        }
      },
      include: orderInclude,
      orderBy: {
        createdAt: "desc"
      }
    });

    return orders.map(serializeOrder);
  },

  async updateStatus(userId: string, role: Role, orderId: string, input: UpdateOrderStatusInput) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shop: true
      }
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (role !== "ADMIN" && order.shop.ownerId !== userId) {
      throw new ApiError(403, "You cannot update this order");
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: input.status
      },
      include: orderInclude
    });

    return serializeOrder(updatedOrder);
  },

  async markPaid(
    orderIds: string[],
    stripeCheckoutSessionId: string,
    stripePaymentIntentId?: string | null
  ) {
    if (orderIds.length === 0) {
      return;
    }

    await prisma.order.updateMany({
      where: {
        id: {
          in: orderIds
        }
      },
      data: {
        status: "PAID",
        paymentStatus: "PAID",
        stripeCheckoutSessionId,
        stripePaymentIntentId: stripePaymentIntentId || null
      }
    });
  }
};
