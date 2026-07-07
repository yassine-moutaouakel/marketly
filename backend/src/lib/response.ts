import type { Response } from "express";

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200) =>
  res.status(statusCode).json({
    message,
    data
  });
