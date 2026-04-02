import type {
  DashboardQuery,
  TrendsQuery,
  CategorySummaryQuery,
} from "./dashboard.schema";
import { dashboardRepository } from "./dashboard.repository";

// ─── Dashboard Service ────────────────────────────────────────────────────────

export class DashboardService {
  /**
   * GET /dashboard/summary
   * Returns overall financial summary: income, expenses, net balance, and recent activity.
   */
  async getSummary(query: DashboardQuery) {
    const { dateFrom, dateTo } = query;

    const { typeTotals, categoryRows, recentActivity, recordCount } =
      await dashboardRepository.getSummaryData(dateFrom, dateTo);

    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const row of typeTotals) {
      if (row.type === "INCOME") {
        totalIncome = row._sum.amount ?? 0;
        incomeCount = row._count.id;
      } else {
        totalExpenses = row._sum.amount ?? 0;
        expenseCount = row._count.id;
      }
    }

    const netBalance = totalIncome - totalExpenses;

    const categorySummary = categoryRows.map((row) => ({
      category: row.category,
      total: row._sum.amount ?? 0,
      count: row._count.id,
    }));

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      recordCount,
      incomeCount,
      expenseCount,
      categorySummary,
      recentActivity,
      period: {
        from: dateFrom ?? null,
        to: dateTo ?? null,
      },
    };
  }

  /**
   * GET /dashboard/trends
   * Returns monthly income vs expense totals for the last N months.
   */
  async getTrends(query: TrendsQuery) {
    const { months } = query;

    // Calculate the start date for the requested number of months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const records = await dashboardRepository.getTrendRows(startDate);

    // Group by YYYY-MM and type
    const trendMap: Map<
      string,
      { month: string; income: number; expense: number; net: number }
    > = new Map();

    for (const record of records) {
      const key = `${record.date.getFullYear()}-${String(
        record.date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!trendMap.has(key)) {
        trendMap.set(key, { month: key, income: 0, expense: 0, net: 0 });
      }

      const entry = trendMap.get(key)!;
      if (record.type === "INCOME") {
        entry.income += record.amount;
      } else {
        entry.expense += record.amount;
      }
      entry.net = entry.income - entry.expense;
    }

    // Sort by month ascending
    const trends = Array.from(trendMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    return { months, trends };
  }

  /**
   * GET /dashboard/category-summary
   * Returns income/expense totals grouped by category.
   */
  async getCategorySummary(query: CategorySummaryQuery) {
    const { type, dateFrom, dateTo } = query;

    const rows = await dashboardRepository.getCategoryTotals(type, dateFrom, dateTo);

    const grouped = new Map<
      string,
      { category: string; income: number; expense: number; net: number; count: number }
    >();

    for (const row of rows) {
      if (!grouped.has(row.category)) {
        grouped.set(row.category, {
          category: row.category,
          income: 0,
          expense: 0,
          net: 0,
          count: 0,
        });
      }

      const entry = grouped.get(row.category)!;
      const amount = row._sum.amount ?? 0;
      const count = row._count.id;

      if (row.type === "INCOME") {
        entry.income += amount;
      } else {
        entry.expense += amount;
      }

      entry.count += count;
      entry.net = entry.income - entry.expense;
    }

    const categories = Array.from(grouped.values()).sort(
      (a, b) => Math.abs(b.net) - Math.abs(a.net)
    );

    return {
      categories,
      filter: {
        type: type ?? "ALL",
        from: dateFrom ?? null,
        to: dateTo ?? null,
      },
    };
  }
}

export const dashboardService = new DashboardService();
