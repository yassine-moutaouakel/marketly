import type { Response } from "express";

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
  meta?: ResponseMeta
) =>
  res.status(statusCode).json({
    message,
    data,
    ...(meta ? { meta } : {})
  });
