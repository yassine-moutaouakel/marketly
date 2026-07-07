import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(10)
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(10)
});
