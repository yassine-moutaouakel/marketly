import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(6).optional(),
  role: z.enum(["BUYER", "SELLER"]).default("BUYER")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
