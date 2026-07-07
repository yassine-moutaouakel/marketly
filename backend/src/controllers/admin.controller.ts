import type { Request, Response } from "express";
import { getRouteParam } from "../lib/request";
import { sendSuccess } from "../lib/response";
import { adminService } from "../services/admin.service";

export const adminController = {
  dashboard: async (_req: Request, res: Response) =>
    sendSuccess(res, await adminService.dashboard()),
  listShops: async (_req: Request, res: Response) =>
    sendSuccess(res, await adminService.listShops()),
  updateShopStatus: async (req: Request, res: Response) =>
    sendSuccess(
      res,
      await adminService.updateShopStatus(getRouteParam(req.params.shopId), req.body),
      "Shop status updated"
    ),
  listProducts: async (_req: Request, res: Response) =>
    sendSuccess(res, await adminService.listProducts()),
  updateProductStatus: async (req: Request, res: Response) =>
    sendSuccess(
      res,
      await adminService.updateProductStatus(getRouteParam(req.params.productId), req.body),
      "Product status updated"
    )
};
