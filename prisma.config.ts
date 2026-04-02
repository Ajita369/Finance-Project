import "dotenv/config";
import { defineConfig } from "prisma/config";

// ─── Prisma v7 Configuration ──────────────────────────────────────────────────

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  },
});
