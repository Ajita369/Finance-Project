import { Request, Response, NextFunction } from "express";
import { usersService } from "./users.service";
import { sendSuccess, sendCreated } from "../../utils/response";
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from "./users.schema";

// ─── Users Controller ─────────────────────────────────────────────────────────

export class UsersController {
  private getIdParam(value: string | string[] | undefined): string {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
  }

  /**
   * GET /users
   * List all users with pagination, filtering, and sorting.
   * Access: ADMIN only
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListUsersQuery;
      const result = await usersService.listUsers(query);
      sendSuccess(res, result, "Users retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /users
   * Create a new user.
   * Access: ADMIN only
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateUserInput;
      const user = await usersService.createUser(input);
      sendCreated(res, user, "User created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/:id
   * Get a specific user by ID.
   * Access: ADMIN only
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this.getIdParam(req.params.id);
      const user = await usersService.getUserById(id);
      sendSuccess(res, user, "User retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/:id
   * Partially update a user's details.
   * Access: ADMIN only
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this.getIdParam(req.params.id);
      const input = req.body as UpdateUserInput;
      const user = await usersService.updateUser(id, input);
      sendSuccess(res, user, "User updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
