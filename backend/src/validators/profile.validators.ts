import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(6).optional().or(z.literal(""))
});
