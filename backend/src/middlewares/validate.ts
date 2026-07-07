import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

type Location = "body" | "params" | "query";

export const validate =
  (schema: ZodTypeAny, location: Location = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    req[location] = schema.parse(req[location]);
    return next();
  };
