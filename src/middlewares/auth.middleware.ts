import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { ERROR_CODES, BEARER_PREFIX } from "../utils/constants";
import type { Role, UserStatus } from "../utils/constants";
import { authRepository } from "../modules/auth/auth.repository";

// ─── JWT Payload Shape ────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  iat?: number;
  exp?: number;
}

// ─── Middleware ────────────────────────────────────────────────────────────────

/**
 * Validates the Bearer JWT in the Authorization header.
 * Attaches the decoded payload to `req.user` on success.
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
      throw ApiError.unauthorized(
        "No token provided",
        ERROR_CODES.TOKEN_MISSING
      );
    }

    const token = authHeader.slice(BEARER_PREFIX.length);

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const authUser = await authRepository.findAuthUserById(decoded.sub);

    if (!authUser) {
      throw ApiError.unauthorized("Invalid token", ERROR_CODES.TOKEN_INVALID);
    }

    if (authUser.status === "INACTIVE") {
      throw ApiError.forbidden(
        "Your account is inactive. Please contact an administrator.",
        ERROR_CODES.ACCOUNT_INACTIVE
      );
    }

    req.user = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: authUser.role,
      status: authUser.status,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      next(
        ApiError.unauthorized("Token has expired", ERROR_CODES.TOKEN_EXPIRED)
      );
      return;
    }

    next(
      ApiError.unauthorized("Invalid token", ERROR_CODES.TOKEN_INVALID)
    );
  }
};

export const authenticate = requireAuth;
