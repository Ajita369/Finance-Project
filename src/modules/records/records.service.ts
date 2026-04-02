import { recordsRepository } from "./records.repository";
import { ApiError } from "../../utils/ApiError";
import { buildPagination } from "../../utils/response";
import type {
  CreateRecordInput,
  UpdateRecordInput,
  ListRecordsQuery,
} from "./records.schema";
import type { Role } from "../../utils/constants";

// ─── Records Service ──────────────────────────────────────────────────────────

export class RecordsService {
  /**
   * List records with filtering, sorting, and pagination.
   */
  async listRecords(query: ListRecordsQuery, actorRole: Role) {
    const includeDeleted = actorRole === "ADMIN" && query.includeDeleted;
    const { items, total } = await recordsRepository.findAll(query, includeDeleted);
    return buildPagination(items, total, query.page, query.limit);
  }

  /**
   * Retrieve a single record by ID. Returns 404 if soft-deleted or not found.
   */
  async getRecordById(id: string) {
    const record = await recordsRepository.findById(id);

    if (!record) {
      throw ApiError.notFound(`Record with id '${id}' not found`);
    }

    return record;
  }

  /**
   * Create a new financial record.
   */
  async createRecord(input: CreateRecordInput, createdById: string) {
    return recordsRepository.create({ ...input, createdById });
  }

  /**
   * Partially update an existing record.
   */
  async updateRecord(
    id: string,
    input: UpdateRecordInput,
    updatedById: string
  ) {
    const exists = await recordsRepository.existsById(id);
    if (!exists) {
      throw ApiError.notFound(`Record with id '${id}' not found`);
    }

    return recordsRepository.update(id, { ...input, updatedById });
  }

  /**
   * Soft-delete a record (sets isDeleted=true, deletedAt=now).
   * Data is preserved; the record is hidden from normal queries.
   */
  async deleteRecord(id: string, deletedById: string) {
    const exists = await recordsRepository.existsById(id);
    if (!exists) {
      throw ApiError.notFound(`Record with id '${id}' not found`);
    }

    return recordsRepository.softDelete(id, deletedById);
  }
}

export const recordsService = new RecordsService();
