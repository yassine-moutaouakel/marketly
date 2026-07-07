import type { Request, Response } from "express";
import { getRouteParam } from "../lib/request";
import { sendSuccess } from "../lib/response";
import { addressService } from "../services/address.service";

export const addressController = {
  list: async (req: Request, res: Response) =>
    sendSuccess(res, await addressService.list(req.user!.id)),
  create: async (req: Request, res: Response) =>
    sendSuccess(res, await addressService.create(req.user!.id, req.body), "Address created", 201),
  update: async (req: Request, res: Response) =>
    sendSuccess(
      res,
      await addressService.update(req.user!.id, getRouteParam(req.params.addressId), req.body),
      "Address updated"
    ),
  remove: async (req: Request, res: Response) =>
    sendSuccess(
      res,
      await addressService.remove(req.user!.id, getRouteParam(req.params.addressId)),
      "Address deleted"
    )
};
