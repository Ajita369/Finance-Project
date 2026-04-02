import express, { Application } from "express";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import recordsRoutes from "./modules/records/records.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import { errorHandler } from "./middlewares/error.middleware";
import { notFound } from "./middlewares/notFound.middleware";
import { sendSuccess } from "./utils/response";

// ─── Application Factory ───────────────────────────────────────────────────────

export function createApp(): Application {
  const app = express();

  // ── Global Middleware ─────────────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ── Health Check ──────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    sendSuccess(
      res,
      {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? "development",
      },
      "Finance Backend is running"
    );
  });

  // ── API Routes ────────────────────────────────────────────────────────────
  app.use("/auth", authRoutes);
  app.use("/users", usersRoutes);
  app.use("/records", recordsRoutes);
  app.use("/dashboard", dashboardRoutes);

  // ── 404 Handler (after all valid routes) ─────────────────────────────────
  app.use(notFound);

  // ── Centralized Error Handler (must be last) ──────────────────────────────
  app.use(errorHandler);

  return app;
}
