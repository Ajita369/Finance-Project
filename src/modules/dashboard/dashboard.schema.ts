import { z } from "zod";

// ─── Dashboard Query ──────────────────────────────────────────────────────────

export const dashboardQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
}).refine(
  (data) => !data.dateFrom || !data.dateTo || data.dateFrom <= data.dateTo,
  {
    message: "dateFrom must be before or equal to dateTo",
    path: ["dateFrom"],
  }
);

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

// ─── Trends Query ─────────────────────────────────────────────────────────────

export const trendsQuerySchema = z.object({
  months: z.coerce
    .number()
    .int()
    .positive()
    .max(24, "Cannot request more than 24 months of trends")
    .default(6),
});

export type TrendsQuery = z.infer<typeof trendsQuerySchema>;

// ─── Category Summary Query ───────────────────────────────────────────────────

export const categorySummaryQuerySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
}).refine(
  (data) => !data.dateFrom || !data.dateTo || data.dateFrom <= data.dateTo,
  {
    message: "dateFrom must be before or equal to dateTo",
    path: ["dateFrom"],
  }
);

export type CategorySummaryQuery = z.infer<typeof categorySummaryQuerySchema>;
