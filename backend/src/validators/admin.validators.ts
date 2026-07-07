import { z } from "zod";

export const updateShopStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "SUSPENDED"])
});

export const updateProductStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "SUSPENDED"])
});
