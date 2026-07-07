import type { Request, Response } from "express";
import { getRouteParam } from "../lib/request";
import { sendSuccess } from "../lib/response";
import { orderService } from "../services/order.service";

export const orderController = {
  checkout: async (req: Request, res: Response) =>
    sendSuccess(res, await orderService.checkout(req.user!.id, req.body), "Orders created", 201),
  listMine: async (req: Request, res: Response) =>
    sendSuccess(res, await orderService.listMine(req.user!.id)),
  listReceived: async (req: Request, res: Response) =>
    sendSuccess(res, await orderService.listReceived(req.user!.id)),
  updateStatus: async (req: Request, res: Response) =>
    sendSuccess(
      res,
      await orderService.updateStatus(
        req.user!.id,
        req.user!.role,
        getRouteParam(req.params.orderId),
        req.body
      ),
      "Order updated"
    )
};
