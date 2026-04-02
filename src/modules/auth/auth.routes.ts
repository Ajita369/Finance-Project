import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { loginSchema } from "./auth.schema";

const router = Router();

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @route   POST /auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
router.post(
  "/login",
  validate(loginSchema),
  (req, res, next) => authController.login(req, res, next)
);

export default router;
