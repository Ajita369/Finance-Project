import { Request } from "express";

/**
 * Augments the Express Request type with the authenticated user payload
 * so TypeScript knows about `req.user` throughout the application.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: import("../utils/constants").Role;
        status: import("../utils/constants").UserStatus;
      };
    }
  }
}

export {};
