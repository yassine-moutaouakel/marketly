import { prisma } from "../config/prisma";
import { ApiError } from "../lib/errors";
import { signToken } from "../lib/jwt";
import { comparePassword, hashPassword } from "../lib/password";
import { serializeAuthPayload, serializeUser } from "../lib/serializers";
import { loginSchema, registerSchema } from "../validators/auth.validators";
import type { z } from "zod";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export const authService = {
  async register(input: RegisterInput) {
    const normalizedEmail = input.email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      throw new ApiError(409, "An account already exists with this email");
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: await hashPassword(input.password),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || null,
        role: input.role,
        cart: {
          create: {}
        }
      }
    });

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return serializeAuthPayload(user, token);
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email.toLowerCase().trim()
      }
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isActive) {
      throw new ApiError(403, "This account has been deactivated");
    }

    const isPasswordValid = await comparePassword(input.password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return serializeAuthPayload(user, token);
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return serializeUser(user);
  }
};
