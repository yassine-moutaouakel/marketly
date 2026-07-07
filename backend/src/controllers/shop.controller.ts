import type { Request, Response } from "express";
import { sendSuccess } from "../lib/response";
import { shopService } from "../services/shop.service";

export const shopController = {
  create: async (req: Request, res: Response) =>
    sendSuccess(res, await shopService.create(req.user!.id, req.body), "Shop created", 201),
  me: async (req: Request, res: Response) =>
    sendSuccess(res, await shopService.getOwnShop(req.user!.id)),
  update: async (req: Request, res: Response) =>
    sendSuccess(res, await shopService.update(req.user!.id, req.body), "Shop updated")
};
