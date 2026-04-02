import prisma from "../../config/prisma";

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findAuthUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }

  async createLoginAuditLog(userId: string) {
    return prisma.auditLog.create({
      data: {
        action: "LOGIN",
        entityType: "User",
        entityId: userId,
        performedById: userId,
      },
    });
  }
}

export const authRepository = new AuthRepository();
