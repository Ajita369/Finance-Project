import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from "./users.schema";

// ─── Selectors ────────────────────────────────────────────────────────────────

/** Omit the password from all user queries */
const safeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

// ─── Repository ───────────────────────────────────────────────────────────────

export class UsersRepository {
  async findAll(query: ListUsersQuery) {
    const { page, limit, role, status, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: safeSelect,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: safeSelect });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserInput & { password: string }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role ?? "VIEWER",
        status: data.status ?? "ACTIVE",
      },
      select: safeSelect,
    });
  }

  async update(id: string, data: Partial<UpdateUserInput & { password: string }>) {
    return prisma.user.update({
      where: { id },
      data,
      select: safeSelect,
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { id } });
    return count > 0;
  }
}

export const usersRepository = new UsersRepository();
