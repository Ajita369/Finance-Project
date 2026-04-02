import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "../../utils/response";
import type { LoginInput } from "./auth.schema";

// ─── Auth Controller ──────────────────────────────────────────────────────────

export class AuthController {
  /**
   * POST /auth/login
   * Validates credentials and returns a JWT access token.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as LoginInput;
      const result = await authService.login(input);

      sendSuccess(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
