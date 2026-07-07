import { prisma } from "../config/prisma";
import { ApiError } from "../lib/errors";
import { serializeAddress } from "../lib/serializers";
import { addressSchema } from "../validators/address.validators";
import type { z } from "zod";

type AddressInput = z.infer<typeof addressSchema>;

export const addressService = {
  async list(userId: string) {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    });

    return addresses.map(serializeAddress);
  },

  async create(userId: string, input: AddressInput) {
    const count = await prisma.address.count({
      where: { userId }
    });

    if (input.isDefault || count === 0) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label: input.label,
        line1: input.line1,
        line2: input.line2 || null,
        city: input.city,
        postalCode: input.postalCode,
        country: input.country,
        isDefault: input.isDefault || count === 0
      }
    });

    return serializeAddress(address);
  },

  async update(userId: string, addressId: string, input: AddressInput) {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId
      }
    });

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        label: input.label,
        line1: input.line1,
        line2: input.line2 || null,
        city: input.city,
        postalCode: input.postalCode,
        country: input.country,
        isDefault: input.isDefault ?? address.isDefault
      }
    });

    return serializeAddress(updatedAddress);
  },

  async remove(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId
      }
    });

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    if (address.isDefault) {
      const latestAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
      });

      if (latestAddress) {
        await prisma.address.update({
          where: { id: latestAddress.id },
          data: { isDefault: true }
        });
      }
    }

    return { deleted: true };
  }
};
