import { z } from "zod";

export const checkoutSchema = z.object({
  addressId: z.string().min(1),
  notes: z.string().max(500).optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["SHIPPED", "DELIVERED", "CANCELLED"])
});
