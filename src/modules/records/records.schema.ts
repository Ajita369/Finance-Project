import { z } from "zod";

// ─── Shared ───────────────────────────────────────────────────────────────────

const recordTypeEnum = z.enum(["INCOME", "EXPENSE"]);

// ─── Create Record ────────────────────────────────────────────────────────────

export const createRecordSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be a positive number"),
  type: recordTypeEnum,
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(100, "Category cannot exceed 100 characters"),
  date: z.coerce.date(),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;

// ─── Update Record ────────────────────────────────────────────────────────────

export const updateRecordSchema = z
  .object({
    amount: z.number().positive("Amount must be a positive number").optional(),
    type: recordTypeEnum.optional(),
    category: z
      .string()
      .trim()
      .min(1, "Category cannot be empty")
      .max(100, "Category cannot exceed 100 characters")
      .optional(),
    date: z.coerce.date().optional(),
    notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  .strict();

export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;

// ─── List Records Query ───────────────────────────────────────────────────────

export const listRecordsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: recordTypeEnum.optional(),
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z
    .enum(["amount", "date", "createdAt", "category"])
    .optional()
    .default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  includeDeleted: z.coerce.boolean().optional().default(false),
}).refine(
  (data) => !data.dateFrom || !data.dateTo || data.dateFrom <= data.dateTo,
  {
    message: "dateFrom must be before or equal to dateTo",
    path: ["dateFrom"],
  }
);

export type ListRecordsQuery = z.infer<typeof listRecordsQuerySchema>;
