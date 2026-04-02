import { Request, Response, NextFunction } from "express";
import { dashboardService } from "./dashboard.service";
import { sendSuccess } from "../../utils/response";
import type {
  DashboardQuery,
  TrendsQuery,
  CategorySummaryQuery,
} from "./dashboard.schema";

// ─── Dashboard Controller ─────────────────────────────────────────────────────

export class DashboardController {
  /**
   * GET /dashboard/summary
   * High-level financial overview: income, expenses, net balance.
   * Access: VIEWER, ANALYST, ADMIN
   */
  async getSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as DashboardQuery;
      const result = await dashboardService.getSummary(query);
      sendSuccess(res, result, "Dashboard summary retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /dashboard/trends
   * Monthly income vs expense trend data.
   * Access: VIEWER, ANALYST, ADMIN
   */
  async getTrends(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as TrendsQuery;
      const result = await dashboardService.getTrends(query);
      sendSuccess(res, result, "Trend data retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /dashboard/category-summary
   * Category-wise income/expense breakdown.
   * Access: VIEWER, ANALYST, ADMIN
   */
  async getCategorySummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as CategorySummaryQuery;
      const result = await dashboardService.getCategorySummary(query);
      sendSuccess(res, result, "Category summary retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
