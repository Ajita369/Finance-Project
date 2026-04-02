import { Router } from "express";
import { usersController } from "./users.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
} from "./users.schema";

const router = Router();

// All user routes require authentication + ADMIN role
router.use(requireAuth, requireAdmin);

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @route   GET /users
 * @desc    List all users with pagination and filters
 * @access  ADMIN
 */
router.get(
  "/",
  validate(listUsersQuerySchema, "query"),
  (req, res, next) => usersController.list(req, res, next)
);

/**
 * @route   POST /users
 * @desc    Create a new user
 * @access  ADMIN
 */
router.post(
  "/",
  validate(createUserSchema),
  (req, res, next) => usersController.create(req, res, next)
);

/**
 * @route   GET /users/:id
 * @desc    Get user by ID
 * @access  ADMIN
 */
router.get("/:id", (req, res, next) =>
  usersController.getById(req, res, next)
);

/**
 * @route   PATCH /users/:id
 * @desc    Partially update user
 * @access  ADMIN
 */
router.patch(
  "/:id",
  validate(updateUserSchema),
  (req, res, next) => usersController.update(req, res, next)
);

export default router;
