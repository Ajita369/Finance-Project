import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireAnyRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  dashboardQuerySchema,
  trendsQuerySchema,
  categorySummaryQuerySchema,
} from "./dashboard.schema";

const router = Router();

// All dashboard routes require authentication
router.use(requireAuth);

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @route   GET /dashboard/summary
 * @desc    High-level financial overview
 * @access  VIEWER, ANALYST, ADMIN
 */
router.get(
  "/summary",
  requireAnyRole(["ADMIN", "ANALYST", "VIEWER"]),
  validate(dashboardQuerySchema, "query"),
  (req, res, next) => dashboardController.getSummary(req, res, next)
);

/**
 * @route   GET /dashboard/trends
 * @desc    Monthly income vs expense trend
 * @access  VIEWER, ANALYST, ADMIN
 */
router.get(
  "/trends",
  requireAnyRole(["ADMIN", "ANALYST"]),
  validate(trendsQuerySchema, "query"),
  (req, res, next) => dashboardController.getTrends(req, res, next)
);

/**
 * @route   GET /dashboard/category-summary
 * @desc    Category-wise totals
 * @access  VIEWER, ANALYST, ADMIN
 */
router.get(
  "/category-summary",
  requireAnyRole(["ADMIN", "ANALYST"]),
  validate(categorySummaryQuerySchema, "query"),
  (req, res, next) => dashboardController.getCategorySummary(req, res, next)
);

export default router;
