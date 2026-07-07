import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  orderIds: z.array(z.string().min(1)).min(1)
});
