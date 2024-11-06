import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // const statusCode = res.statusCode !== 200 ? res.statusCode : 500; // Use existing status code if it's not 200, otherwise default to 500

  res.status(500).json({
    message: err.message, // Send the error message
    stack: process.env.NODE_ENV === "production" ? null : err.stack, // Include stack trace only in development mode
  });
};
