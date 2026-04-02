import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { ERROR_CODES } from "../../utils/constants";
import type { LoginInput } from "./auth.schema";
import type { JwtPayload } from "../../middlewares/auth.middleware";
import { authRepository } from "./auth.repository";

// ─── Auth Service ─────────────────────────────────────────────────────────────

export class AuthService {
  /**
   * Validates credentials, records audit log, and returns a signed JWT.
   */
  async login(input: LoginInput): Promise<{ token: string; user: SafeUser }> {
    // 1. Find user by email
    const user = await authRepository.findByEmail(input.email);

    if (!user) {
      throw ApiError.unauthorized(
        "Invalid email or password",
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    // 2. Check account status
    if (user.status === "INACTIVE") {
      throw ApiError.forbidden(
        "Your account is inactive. Please contact an administrator.",
        ERROR_CODES.ACCOUNT_INACTIVE
      );
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized(
        "Invalid email or password",
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    // 4. Sign JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    // 5. Audit log (fire-and-forget)
    authRepository
      .createLoginAuditLog(user.id)
      .catch(console.error);

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };

    return { token, user: safeUser };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
}

export const authService = new AuthService();
