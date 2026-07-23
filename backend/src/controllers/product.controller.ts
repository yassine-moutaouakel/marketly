import type { Request, Response } from "express";
import type { z } from "zod";
import type { productQuerySchema } from "../validators/product.validators";
import { getRouteParam } from "../lib/request";
import { sendSuccess } from "../lib/response";
import { productService } from "../services/product.service";

export const productController = {
  list: async (req: Request, res: Response) => {
    // req.query is validated and coerced by the validate(productQuerySchema, "query") middleware
    const query = req.query as unknown as z.infer<typeof productQuerySchema>;
    const { items, meta } = await productService.list(query);
    return sendSuccess(res, items, undefined, 200, meta);
  },
  listMine: async (req: Request, res: Response) =>
    sendSuccess(res, await productService.listMine(req.user!.id)),
  getById: async (req: Request, res: Response) =>
    sendSuccess(
      res,
      await productService.getById(getRouteParam(req.params.productId), req.user?.id, req.user?.role)
    ),
  create: async (req: Request, res: Response) =>
    sendSuccess(res, await productService.create(req.user!.id, req.body), "Product created", 201),
  update: async (req: Request, res: Response) =>
    sendSuccess(
      res,
      await productService.update(
        req.user!.id,
        req.user!.role,
        getRouteParam(req.params.productId),
        req.body
      ),
      "Product updated"
    ),
  remove: async (req: Request, res: Response) =>
    sendSuccess(
      res,
      await productService.remove(
        req.user!.id,
        req.user!.role,
        getRouteParam(req.params.productId)
      ),
      "Product deleted"
    )
};
