import type { Request, Response } from "express";
import { getRouteParam } from "../lib/request";
import { sendSuccess } from "../lib/response";
import { cartService } from "../services/cart.service";

export const cartController = {
  get: async (req: Request, res: Response) =>
    sendSuccess(res, await cartService.get(req.user!.id)),
  addItem: async (req: Request, res: Response) =>
    sendSuccess(res, await cartService.addItem(req.user!.id, req.body), "Item added to cart"),
  updateItem: async (req: Request, res: Response) =>
    sendSuccess(
      res,
      await cartService.updateItem(req.user!.id, getRouteParam(req.params.productId), req.body),
      "Cart updated"
    ),
  removeItem: async (req: Request, res: Response) =>
    sendSuccess(
      res,
      await cartService.removeItem(req.user!.id, getRouteParam(req.params.productId)),
      "Item removed"
    )
};
