import { Request, Response } from "express";

/**
 * Handles any request that reaches this middleware with a 404.
 * Register this AFTER all routes but BEFORE the error handler.
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errorCode: "NOT_FOUND",
  });
};
