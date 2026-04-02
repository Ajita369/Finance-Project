import { Router } from "express";
import { recordsController } from "./records.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  requireAnyRole,
  requireAdmin,
} from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createRecordSchema,
  updateRecordSchema,
  listRecordsQuerySchema,
} from "./records.schema";

const router = Router();

// All records routes require authentication
router.use(requireAuth);

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @route   GET /records
 * @desc    List records (with filters, pagination, sorting)
 * @access  VIEWER, ANALYST, ADMIN
 */
router.get(
  "/",
  requireAnyRole(["ADMIN", "ANALYST", "VIEWER"]),
  validate(listRecordsQuerySchema, "query"),
  (req, res, next) => recordsController.list(req, res, next)
);

/**
 * @route   POST /records
 * @desc    Create a new financial record
 * @access  ADMIN
 */
router.post(
  "/",
  requireAdmin,
  validate(createRecordSchema),
  (req, res, next) => recordsController.create(req, res, next)
);

/**
 * @route   GET /records/:id
 * @desc    Get a single record by ID
 * @access  VIEWER, ANALYST, ADMIN
 */
router.get("/:id", requireAnyRole(["ADMIN", "ANALYST", "VIEWER"]), (req, res, next) =>
  recordsController.getById(req, res, next)
);

/**
 * @route   PATCH /records/:id
 * @desc    Partially update a financial record
 * @access  ADMIN
 */
router.patch(
  "/:id",
  requireAdmin,
  validate(updateRecordSchema),
  (req, res, next) => recordsController.update(req, res, next)
);

/**
 * @route   DELETE /records/:id
 * @desc    Soft-delete a financial record
 * @access  ADMIN
 */
router.delete("/:id", requireAdmin, (req, res, next) =>
  recordsController.remove(req, res, next)
);

export default router;
