import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ERROR_CODES, type Role } from "../utils/constants";

/**
 * Returns a middleware that restricts access to users whose role
 * is included in the `allowedRoles` list.
 *
 * Usage:
 *   router.get("/admin-only", authenticate, requireRole("ADMIN"), handler);
 *   router.get("/multi-role", authenticate, requireRole("ADMIN", "ANALYST"), handler);
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(
        ApiError.unauthorized(
          "Authentication required",
          ERROR_CODES.TOKEN_MISSING
        )
      );
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
          ERROR_CODES.FORBIDDEN
        )
      );
      return;
    }

    next();
  };
};

/**
 * Restricts to ADMIN only.
 */
export const requireAdmin = requireRole("ADMIN");

/**
 * Restricts to ADMIN or ANALYST.
 */
export const requireAnalystOrAbove = requireRole("ADMIN", "ANALYST");

/**
 * Allows any selected roles.
 */
export const requireAnyRole = (roles: Role[]) => requireRole(...roles);
