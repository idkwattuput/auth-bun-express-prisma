import { allowedOrigins } from "../config/allowed-origins";
import type { Request, Response, NextFunction } from "express";

export const credentials = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
};
