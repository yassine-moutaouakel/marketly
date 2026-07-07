import { prisma } from "../config/prisma";
import { ApiError } from "../lib/errors";
import { serializeAddress, serializeOrder, serializeShop, serializeUser } from "../lib/serializers";
import { updateProfileSchema } from "../validators/profile.validators";
import type { z } from "zod";

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const profileService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
        },
        shop: true
      }
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const recentOrders = await prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        items: true,
        shop: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    });

    return {
      ...serializeUser(user),
      addresses: user.addresses.map(serializeAddress),
      shop: user.shop ? serializeShop(user.shop) : null,
      orderHistory: recentOrders.map(serializeOrder)
    };
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || null
      }
    });

    return serializeUser(user);
  }
};
