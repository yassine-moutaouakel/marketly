import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../lib/response";

export const authController = {
  register: async (req: Request, res: Response) =>
    sendSuccess(res, await authService.register(req.body), "Registration successful", 201),
  login: async (req: Request, res: Response) =>
    sendSuccess(res, await authService.login(req.body), "Login successful"),
  me: async (req: Request, res: Response) =>
    sendSuccess(res, await authService.me(req.user!.id))
};
