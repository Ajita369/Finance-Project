import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";

export class DashboardRepository {
  async getSummaryData(dateFrom?: Date, dateTo?: Date) {
    const dateWhere = this.buildDateWhere(dateFrom, dateTo);

    const [typeTotals, categoryRows, recentActivity, recordCount] =
      await prisma.$transaction([
        prisma.record.groupBy({
          by: ["type"],
          where: {
            isDeleted: false,
            ...dateWhere,
          },
          orderBy: {
            type: "asc",
          },
          _sum: { amount: true },
          _count: { id: true },
        }),
        prisma.record.groupBy({
          by: ["category"],
          where: {
            isDeleted: false,
            ...dateWhere,
          },
          _sum: { amount: true },
          _count: { id: true },
          orderBy: {
            _sum: { amount: "desc" },
          },
        }),
        prisma.record.findMany({
          where: {
            isDeleted: false,
            ...dateWhere,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            amount: true,
            type: true,
            category: true,
            date: true,
            notes: true,
            createdAt: true,
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.record.count({
          where: {
            isDeleted: false,
            ...dateWhere,
          },
        }),
      ]);

    return { typeTotals, categoryRows, recentActivity, recordCount };
  }

  async getTrendRows(startDate: Date) {
    return prisma.record.findMany({
      where: {
        isDeleted: false,
        date: { gte: startDate },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: "asc" },
    });
  }

  async getCategoryTotals(type?: "INCOME" | "EXPENSE", dateFrom?: Date, dateTo?: Date) {
    const dateWhere = this.buildDateWhere(dateFrom, dateTo);

    return prisma.record.groupBy({
      by: ["category", "type"],
      where: {
        isDeleted: false,
        ...(type && { type }),
        ...dateWhere,
      },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
    });
  }

  private buildDateWhere(dateFrom?: Date, dateTo?: Date): Prisma.RecordWhereInput {
    if (!dateFrom && !dateTo) return {};

    return {
      date: {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      },
    };
  }
}

export const dashboardRepository = new DashboardRepository();
