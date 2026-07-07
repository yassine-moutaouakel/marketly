import type { Request, Response } from "express";
import { sendSuccess } from "../lib/response";
import { categoryService } from "../services/category.service";

export const categoryController = {
  list: async (_req: Request, res: Response) => sendSuccess(res, await categoryService.list()),
  create: async (req: Request, res: Response) =>
    sendSuccess(res, await categoryService.create(req.body), "Category created", 201)
};
