import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import type {
  CreateRecordInput,
  UpdateRecordInput,
  ListRecordsQuery,
} from "./records.schema";

// ─── Selector ─────────────────────────────────────────────────────────────────

const recordSelect = {
  id: true,
  amount: true,
  type: true,
  category: true,
  date: true,
  notes: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: {
    select: { id: true, name: true, email: true },
  },
  updatedBy: {
    select: { id: true, name: true, email: true },
  },
} satisfies Prisma.RecordSelect;

// ─── Repository ───────────────────────────────────────────────────────────────

export class RecordsRepository {
  async findAll(query: ListRecordsQuery, includeDeleted = false) {
    const {
      page,
      limit,
      type,
      category,
      search,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RecordWhereInput = {
      isDeleted: includeDeleted ? undefined : false,
      ...(type && { type }),
      ...(category && { category: { contains: category } }),
      ...(search && {
        OR: [
          { category: { contains: search } },
          { notes: { contains: search } },
        ],
      }),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.record.findMany({
        where,
        select: recordSelect,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.record.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.record.findFirst({
      where: { id, isDeleted: false },
      select: recordSelect,
    });
  }

  async create(data: CreateRecordInput & { createdById: string }) {
    return prisma.record.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date,
        notes: data.notes,
        createdById: data.createdById,
      },
      select: recordSelect,
    });
  }

  async update(
    id: string,
    data: UpdateRecordInput & { updatedById: string }
  ) {
    return prisma.record.update({
      where: { id },
      data: {
        ...data,
      },
      select: recordSelect,
    });
  }

  async softDelete(id: string, deletedById: string) {
    return prisma.record.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updatedById: deletedById,
      },
      select: recordSelect,
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await prisma.record.count({
      where: { id, isDeleted: false },
    });
    return count > 0;
  }

  // ─── Dashboard Aggregates ──────────────────────────────────────────────────

  async sumByType(dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.RecordWhereInput = {
      isDeleted: false,
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {}),
    };

    return prisma.record.groupBy({
      by: ["type"],
      where,
      _sum: { amount: true },
      _count: { id: true },
    });
  }

  async sumByCategory(
    type?: "INCOME" | "EXPENSE",
    dateFrom?: Date,
    dateTo?: Date
  ) {
    const where: Prisma.RecordWhereInput = {
      isDeleted: false,
      ...(type && { type }),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {}),
    };

    return prisma.record.groupBy({
      by: ["category", "type"],
      where,
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
    });
  }

  async findRecent(limit = 10) {
    return prisma.record.findMany({
      where: { isDeleted: false },
      select: recordSelect,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const recordsRepository = new RecordsRepository();
