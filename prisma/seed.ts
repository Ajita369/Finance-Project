import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // ─── Cleanup ────────────────────────────────────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.record.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ──────────────────────────────────────────────────────────────────
  const saltRounds = 10;

  const adminPassword = await bcrypt.hash("Admin@123", saltRounds);
  const analystPassword = await bcrypt.hash("Analyst@123", saltRounds);
  const viewerPassword = await bcrypt.hash("Viewer@123", saltRounds);

  const admin = await prisma.user.create({
    data: {
      name: "Alice Admin",
      email: "admin@finance.local",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Bob Analyst",
      email: "analyst@finance.local",
      password: analystPassword,
      role: "ANALYST",
      status: "ACTIVE",
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Carol Viewer",
      email: "viewer@finance.local",
      password: viewerPassword,
      role: "VIEWER",
      status: "ACTIVE",
    },
  });

  console.log(
    `✅ Created users: ${admin.email}, ${analyst.email}, ${viewer.email}`
  );

  // ─── Records ────────────────────────────────────────────────────────────────
  const recordsData = [
    {
      amount: 5000,
      type: "INCOME" as const,
      category: "Salary",
      date: new Date("2025-01-15"),
      notes: "Monthly salary - January",
      createdById: admin.id,
    },
    {
      amount: 1200,
      type: "EXPENSE" as const,
      category: "Rent",
      date: new Date("2025-01-01"),
      notes: "Office rent - January",
      createdById: admin.id,
    },
    {
      amount: 3500,
      type: "INCOME" as const,
      category: "Freelance",
      date: new Date("2025-01-20"),
      notes: "Freelance project payment",
      createdById: analyst.id,
    },
    {
      amount: 200,
      type: "EXPENSE" as const,
      category: "Utilities",
      date: new Date("2025-01-10"),
      notes: "Electricity bill",
      createdById: admin.id,
    },
    {
      amount: 450,
      type: "EXPENSE" as const,
      category: "Software",
      date: new Date("2025-01-25"),
      notes: "SaaS subscriptions",
      createdById: analyst.id,
    },
    {
      amount: 5000,
      type: "INCOME" as const,
      category: "Salary",
      date: new Date("2025-02-15"),
      notes: "Monthly salary - February",
      createdById: admin.id,
    },
    {
      amount: 1200,
      type: "EXPENSE" as const,
      category: "Rent",
      date: new Date("2025-02-01"),
      notes: "Office rent - February",
      createdById: admin.id,
    },
    {
      amount: 800,
      type: "EXPENSE" as const,
      category: "Marketing",
      date: new Date("2025-02-18"),
      notes: "Ad campaign spend",
      createdById: analyst.id,
    },
    {
      amount: 300,
      type: "EXPENSE" as const,
      category: "Transport",
      date: new Date("2025-02-22"),
      notes: "Client visit travel",
      createdById: admin.id,
    },
    {
      amount: 5200,
      type: "INCOME" as const,
      category: "Salary",
      date: new Date("2025-03-15"),
      notes: "Monthly salary - March",
      createdById: admin.id,
    },
    {
      amount: 1700,
      type: "INCOME" as const,
      category: "Consulting",
      date: new Date("2025-03-12"),
      notes: "Consulting retainer",
      createdById: analyst.id,
    },
    {
      amount: 1250,
      type: "EXPENSE" as const,
      category: "Rent",
      date: new Date("2025-03-01"),
      notes: "Office rent - March",
      createdById: admin.id,
    },
    {
      amount: 240,
      type: "EXPENSE" as const,
      category: "Utilities",
      date: new Date("2025-03-10"),
      notes: "Internet and electricity",
      createdById: analyst.id,
    },
    {
      amount: 450,
      type: "EXPENSE" as const,
      category: "Software",
      date: new Date("2025-03-20"),
      notes: "Project management tools",
      createdById: admin.id,
    },
    {
      amount: 1500,
      type: "INCOME" as const,
      category: "Training",
      date: new Date("2025-04-08"),
      notes: "Corporate training workshop",
      createdById: analyst.id,
    },
    {
      amount: 5300,
      type: "INCOME" as const,
      category: "Salary",
      date: new Date("2025-04-15"),
      notes: "Monthly salary - April",
      createdById: admin.id,
    },
    {
      amount: 1250,
      type: "EXPENSE" as const,
      category: "Rent",
      date: new Date("2025-04-01"),
      notes: "Office rent - April",
      createdById: admin.id,
    },
    {
      amount: 680,
      type: "EXPENSE" as const,
      category: "Equipment",
      date: new Date("2025-04-18"),
      notes: "Monitor and peripherals",
      createdById: analyst.id,
    },
    {
      amount: 210,
      type: "EXPENSE" as const,
      category: "Transport",
      date: new Date("2025-04-24"),
      notes: "Local commute reimbursements",
      createdById: admin.id,
    },
    {
      amount: 5400,
      type: "INCOME" as const,
      category: "Salary",
      date: new Date("2025-05-15"),
      notes: "Monthly salary - May",
      createdById: admin.id,
    },
    {
      amount: 2600,
      type: "INCOME" as const,
      category: "Freelance",
      date: new Date("2025-05-09"),
      notes: "Frontend modernization project",
      createdById: analyst.id,
    },
    {
      amount: 1300,
      type: "EXPENSE" as const,
      category: "Rent",
      date: new Date("2025-05-01"),
      notes: "Office rent - May",
      createdById: admin.id,
    },
    {
      amount: 900,
      type: "EXPENSE" as const,
      category: "Marketing",
      date: new Date("2025-05-19"),
      notes: "Search ads budget",
      createdById: analyst.id,
    },
    {
      amount: 410,
      type: "EXPENSE" as const,
      category: "Software",
      date: new Date("2025-05-25"),
      notes: "Analytics tooling licenses",
      createdById: admin.id,
    },
    {
      amount: 5500,
      type: "INCOME" as const,
      category: "Salary",
      date: new Date("2025-06-15"),
      notes: "Monthly salary - June",
      createdById: admin.id,
    },
    {
      amount: 1800,
      type: "INCOME" as const,
      category: "Consulting",
      date: new Date("2025-06-06"),
      notes: "Business optimization consulting",
      createdById: analyst.id,
    },
    {
      amount: 1300,
      type: "EXPENSE" as const,
      category: "Rent",
      date: new Date("2025-06-01"),
      notes: "Office rent - June",
      createdById: admin.id,
    },
    {
      amount: 260,
      type: "EXPENSE" as const,
      category: "Utilities",
      date: new Date("2025-06-11"),
      notes: "Utilities - June",
      createdById: analyst.id,
    },
    {
      amount: 720,
      type: "EXPENSE" as const,
      category: "Equipment",
      date: new Date("2025-06-23"),
      notes: "Workstation upgrade",
      createdById: admin.id,
    },
  ];

  await prisma.record.createMany({ data: recordsData });

  console.log(`✅ Created ${recordsData.length} financial records`);

  // ─── Audit Logs ─────────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        action: "LOGIN",
        entityType: "User",
        entityId: admin.id,
        metadata: JSON.stringify({ ip: "127.0.0.1" }),
        performedById: admin.id,
      },
      {
        action: "CREATE",
        entityType: "User",
        entityId: analyst.id,
        metadata: JSON.stringify({ role: "ANALYST" }),
        performedById: admin.id,
      },
    ],
  });

  console.log("✅ Created audit log entries");
  console.log("\n🎉 Seed completed successfully!");
  console.log("\nDefault credentials:");
  console.log("  Admin   → admin@finance.local    / Admin@123");
  console.log("  Analyst → analyst@finance.local  / Analyst@123");
  console.log("  Viewer  → viewer@finance.local   / Viewer@123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
