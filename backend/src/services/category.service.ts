import { prisma } from "../config/prisma";
import { ApiError } from "../lib/errors";
import { serializeCategory } from "../lib/serializers";
import { slugify } from "../lib/slug";
import { categorySchema } from "../validators/category.validators";
import type { z } from "zod";

type CategoryInput = z.infer<typeof categorySchema>;

export const categoryService = {
  async list() {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc"
      }
    });

    return categories.map(serializeCategory);
  },

  async create(input: CategoryInput) {
    const slug = slugify(input.name);
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      throw new ApiError(409, "Category already exists");
    }

    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description || null
      }
    });

    return serializeCategory(category);
  }
};
