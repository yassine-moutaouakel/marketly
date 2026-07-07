import { z } from "zod";

export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  shopId: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  featured: z
    .union([z.literal("true"), z.literal("false")])
    .transform((value) => value === "true")
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SUSPENDED"]).optional()
});

export const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  sku: z.string().optional(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
  isFeatured: z.boolean().optional().default(false),
  imageUrls: z.array(z.string().url()).min(1).max(5)
});

export const updateProductSchema = createProductSchema.partial();
