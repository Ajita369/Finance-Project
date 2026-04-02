import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

/**
 * Centralized error handling middleware.
 * Must be registered LAST in the Express app so it catches all errors.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ── Operational (known) errors ─────────────────────────────────────────────
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
    return;
  }

  // ── Prisma known request errors ────────────────────────────────────────────
  // P2002 = Unique constraint violation
  if ((err as { code?: string }).code === "P2002") {
    res.status(409).json({
      success: false,
      message: "A record with those details already exists",
      errorCode: "ALREADY_EXISTS",
    });
    return;
  }

  // P2025 = Record not found
  if ((err as { code?: string }).code === "P2025") {
    res.status(404).json({
      success: false,
      message: "Record not found",
      errorCode: "NOT_FOUND",
    });
    return;
  }

  // ── Unknown (programming) errors ───────────────────────────────────────────
  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "production" ? "Internal server error" : err.message,
    errorCode: "INTERNAL_ERROR",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
