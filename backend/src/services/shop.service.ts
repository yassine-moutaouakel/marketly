import { ShopStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../lib/errors";
import { serializeShop } from "../lib/serializers";
import { slugify } from "../lib/slug";
import { shopSchema } from "../validators/shop.validators";
import type { z } from "zod";

type ShopInput = z.infer<typeof shopSchema>;

const createUniqueShopSlug = async (name: string) => {
  const baseSlug = slugify(name);
  let candidate = baseSlug;
  let counter = 1;

  while (await prisma.shop.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }

  return candidate;
};

export const shopService = {
  async create(userId: string, input: ShopInput) {
    const existingShop = await prisma.shop.findUnique({
      where: { ownerId: userId }
    });

    if (existingShop) {
      throw new ApiError(409, "This seller already owns a shop");
    }

    const shop = await prisma.shop.create({
      data: {
        ownerId: userId,
        name: input.name,
        slug: await createUniqueShopSlug(input.name),
        description: input.description,
        logoUrl: input.logoUrl || null,
        bannerUrl: input.bannerUrl || null,
        status: ShopStatus.PENDING
      },
      include: {
        owner: true
      }
    });

    return serializeShop(shop);
  },

  async getOwnShop(userId: string) {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: userId },
      include: {
        owner: true
      }
    });

    if (!shop) {
      throw new ApiError(404, "Shop not found");
    }

    return serializeShop(shop);
  },

  async update(userId: string, input: ShopInput) {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: userId }
    });

    if (!shop) {
      throw new ApiError(404, "Shop not found");
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        name: input.name,
        description: input.description,
        logoUrl: input.logoUrl || null,
        bannerUrl: input.bannerUrl || null
      },
      include: {
        owner: true
      }
    });

    return serializeShop(updatedShop);
  }
};
