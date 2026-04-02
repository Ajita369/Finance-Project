import { createApp } from "./app";
import { env } from "./config/env";
import prisma from "./config/prisma";

// ─── Bootstrap ─────────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  // Verify database connectivity before starting the HTTP server
  await prisma.$connect();
  console.log("✅ Database connected");

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(
      `🚀 Finance Backend running on http://localhost:${env.PORT} [${env.NODE_ENV}]`
    );
    console.log(`📋 Health check: http://localhost:${env.PORT}/health`);
  });

  // ── Graceful Shutdown ──────────────────────────────────────────────────────

  const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      await prisma.$disconnect();
      console.log("✅ Database disconnected. Goodbye!");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // ── Unhandled Rejections ───────────────────────────────────────────────────

  process.on("unhandledRejection", (reason: unknown) => {
    console.error("Unhandled Promise Rejection:", reason);
    process.exit(1);
  });

  process.on("uncaughtException", (error: Error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
