import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/modules/records/records.repository", () => ({
  recordsRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    existsById: vi.fn(),
  },
}));

import { recordsService } from "../src/modules/records/records.service";
import { recordsRepository } from "../src/modules/records/records.repository";

describe("records.service listRecords", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forces includeDeleted=false for non-admin roles", async () => {
    vi.mocked(recordsRepository.findAll).mockResolvedValue({
      items: [],
      total: 0,
    });

    await recordsService.listRecords(
      {
        page: 1,
        limit: 20,
        sortBy: "date",
        sortOrder: "desc",
        includeDeleted: true,
      },
      "VIEWER"
    );

    expect(recordsRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ includeDeleted: true }),
      false
    );
  });

  it("allows includeDeleted=true for admin", async () => {
    vi.mocked(recordsRepository.findAll).mockResolvedValue({
      items: [],
      total: 0,
    });

    await recordsService.listRecords(
      {
        page: 1,
        limit: 20,
        sortBy: "date",
        sortOrder: "desc",
        includeDeleted: true,
      },
      "ADMIN"
    );

    expect(recordsRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ includeDeleted: true }),
      true
    );
  });
});
