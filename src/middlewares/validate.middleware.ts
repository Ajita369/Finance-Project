import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { HTTP_STATUS } from "../utils/constants";

// ─── Target keys ─────────────────────────────────────────────────────────────

type ValidationTarget = "body" | "query" | "params";

// ─── Middleware Factory ───────────────────────────────────────────────────────

/**
 * Validates the specified part of a request against a Zod schema.
 * On failure returns 422 with field-level error details.
 */
export const validate =
  <T>(schema: ZodSchema<T>, target: ValidationTarget = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        errors,
      });
      return;
    }

    // Replace req[target] with the parsed (and coerced) data
    req[target] = result.data as typeof req[typeof target];
    next();
  };

// ─── Formatter ────────────────────────────────────────────────────────────────

function formatZodErrors(
  error: ZodError
): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    if (!formatted[key]) formatted[key] = [];
    formatted[key].push(issue.message);
  }

  return formatted;
}
