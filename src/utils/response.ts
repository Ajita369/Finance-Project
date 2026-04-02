import { Response } from "express";

// ─── Success Response ─────────────────────────────────────────────────────────

export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

// ─── Error Response ───────────────────────────────────────────────────────────

export interface ErrorResponse {
  success: false;
  message: string;
  errorCode: string;
}

// ─── Paginated Response ───────────────────────────────────────────────────────

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): void {
  const body: SuccessResponse<T> = { success: true, message, data };
  res.status(statusCode).json(body);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message = "Created successfully"
): void {
  sendSuccess(res, data, message, 201);
}

export function sendError(
  res: Response,
  message: string,
  errorCode: string,
  statusCode = 500
): void {
  const body: ErrorResponse = { success: false, message, errorCode };
  res.status(statusCode).json(body);
}

export function buildPagination<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedData<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
