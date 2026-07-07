import type { Request, Response } from "express";
import { sendSuccess } from "../lib/response";
import { profileService } from "../services/profile.service";

export const profileController = {
  get: async (req: Request, res: Response) =>
    sendSuccess(res, await profileService.getProfile(req.user!.id)),
  update: async (req: Request, res: Response) =>
    sendSuccess(res, await profileService.updateProfile(req.user!.id, req.body), "Profile updated")
};
