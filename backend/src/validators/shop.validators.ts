import { z } from "zod";

export const shopSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal(""))
});
