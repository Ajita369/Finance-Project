import { z } from "zod";

// ─── Shared ───────────────────────────────────────────────────────────────────

const roleEnum = z.enum(["VIEWER", "ANALYST", "ADMIN"]);
const statusEnum = z.enum(["ACTIVE", "INACTIVE"]);

// ─── Create User ──────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Must be a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password cannot exceed 72 characters"),
  role: roleEnum.optional().default("VIEWER"),
  status: statusEnum.optional().default("ACTIVE"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// ─── Update User ──────────────────────────────────────────────────────────────

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),
    role: roleEnum.optional(),
    status: statusEnum.optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password cannot exceed 72 characters")
      .optional(),
  })
  .strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ─── List Users Query ─────────────────────────────────────────────────────────

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: roleEnum.optional(),
  status: statusEnum.optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(["name", "email", "createdAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
