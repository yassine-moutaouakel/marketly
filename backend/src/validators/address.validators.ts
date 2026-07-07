import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(2),
  line1: z.string().min(4),
  line2: z.string().optional(),
  city: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  isDefault: z.boolean().optional().default(false)
});
