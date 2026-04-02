import { describe, it, expect, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { requireRole } from "../src/middlewares/role.middleware";
import { ApiError } from "../src/utils/ApiError";

describe("role.middleware", () => {
  it("returns 401 when request has no authenticated user", () => {
    const middleware = requireRole("ADMIN");
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(401);
  });

  it("returns 403 when authenticated user role is not allowed", () => {
    const middleware = requireRole("ADMIN");
    const req = {
      user: {
        id: "u1",
        email: "viewer@finance.local",
        name: "Viewer",
        role: "VIEWER",
        status: "ACTIVE",
      },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(403);
  });

  it("allows request when role is permitted", () => {
    const middleware = requireRole("ADMIN", "ANALYST");
    const req = {
      user: {
        id: "u2",
        email: "analyst@finance.local",
        name: "Analyst",
        role: "ANALYST",
        status: "ACTIVE",
      },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
