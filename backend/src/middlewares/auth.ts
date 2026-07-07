import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/errors";
import { verifyToken } from "../lib/jwt";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authorization token is required"));
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};
