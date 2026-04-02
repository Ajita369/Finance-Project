import bcrypt from "bcryptjs";
import { usersRepository } from "./users.repository";
import { ApiError } from "../../utils/ApiError";
import { ERROR_CODES } from "../../utils/constants";
import { env } from "../../config/env";
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from "./users.schema";
import { buildPagination } from "../../utils/response";

// ─── Users Service ────────────────────────────────────────────────────────────

export class UsersService {
  /**
   * List all users with pagination, filtering, and sorting.
   */
  async listUsers(query: ListUsersQuery) {
    const { items, total } = await usersRepository.findAll(query);
    return buildPagination(items, total, query.page, query.limit);
  }

  /**
   * Get a single user by ID. Throws 404 if not found.
   */
  async getUserById(id: string) {
    const user = await usersRepository.findById(id);

    if (!user) {
      throw ApiError.notFound(`User with id '${id}' not found`);
    }

    return user;
  }

  /**
   * Create a new user after checking for duplicate email.
   */
  async createUser(input: CreateUserInput) {
    // Check for duplicate email
    const existing = await usersRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict(
        "A user with this email already exists",
        ERROR_CODES.ALREADY_EXISTS
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      input.password,
      env.BCRYPT_SALT_ROUNDS
    );

    return usersRepository.create({ ...input, password: hashedPassword });
  }

  /**
   * Update an existing user. Only an admin should call this.
   */
  async updateUser(id: string, input: UpdateUserInput) {
    // Ensure user exists
    const exists = await usersRepository.existsById(id);
    if (!exists) {
      throw ApiError.notFound(`User with id '${id}' not found`);
    }

    const updateData: Partial<typeof input & { password: string }> = {
      ...input,
    };

    // Hash new password if provided
    if (input.password) {
      updateData.password = await bcrypt.hash(
        input.password,
        env.BCRYPT_SALT_ROUNDS
      );
    }

    return usersRepository.update(id, updateData);
  }
}

export const usersService = new UsersService();
