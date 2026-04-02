import { Request, Response, NextFunction } from "express";
import { recordsService } from "./records.service";
import { sendSuccess, sendCreated } from "../../utils/response";
import type {
  CreateRecordInput,
  UpdateRecordInput,
  ListRecordsQuery,
} from "./records.schema";

// ─── Records Controller ───────────────────────────────────────────────────────

export class RecordsController {
  private getIdParam(value: string | string[] | undefined): string {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
  }

  /**
   * GET /records
   * List records with filtering and pagination.
   * Access: VIEWER, ANALYST, ADMIN
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListRecordsQuery;
      const role = req.user!.role;
      const result = await recordsService.listRecords(query, role);
      sendSuccess(res, result, "Records retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /records
   * Create a new financial record.
   * Access: ADMIN only
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateRecordInput;
      const userId = req.user!.id;
      const record = await recordsService.createRecord(input, userId);
      sendCreated(res, record, "Record created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /records/:id
   * Get a single financial record.
   * Access: VIEWER, ANALYST, ADMIN
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this.getIdParam(req.params.id);
      const record = await recordsService.getRecordById(id);
      sendSuccess(res, record, "Record retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /records/:id
   * Partially update a financial record.
   * Access: ADMIN only
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this.getIdParam(req.params.id);
      const input = req.body as UpdateRecordInput;
      const userId = req.user!.id;
      const record = await recordsService.updateRecord(id, input, userId);
      sendSuccess(res, record, "Record updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /records/:id
   * Soft-delete a financial record.
   * Access: ADMIN only
   */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this.getIdParam(req.params.id);
      const userId = req.user!.id;
      await recordsService.deleteRecord(id, userId);
      sendSuccess(res, null, "Record deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const recordsController = new RecordsController();
