import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = {
  checkStorageConnection: vi.fn(),
  ensureStorageFolder: vi.fn(),
};

let bootstrapStorage;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  mocks.checkStorageConnection.mockReset();
  mocks.ensureStorageFolder.mockReset();

  vi.doMock("../../src/modules/platform/storage/storage.service.js", () => mocks);

  const module = await import("../../src/modules/platform/storage/storage.bootstrap.js");
  bootstrapStorage = module.bootstrapStorage;
});

afterEach(() => {
  vi.doUnmock("../../src/modules/platform/storage/storage.service.js");
  vi.resetModules();
  vi.clearAllMocks();
});

describe("storage bootstrap", () => {
  it("checks connection and creates storage folders", async () => {
    mocks.checkStorageConnection.mockResolvedValue(true);
    mocks.ensureStorageFolder.mockResolvedValue(true);

    await bootstrapStorage();

    expect(mocks.checkStorageConnection).toHaveBeenCalledTimes(1);
    expect(mocks.ensureStorageFolder).toHaveBeenCalledWith();
    expect(mocks.ensureStorageFolder).toHaveBeenCalledWith("users");
    expect(mocks.ensureStorageFolder).toHaveBeenCalledWith("users/profile-photos");
    expect(mocks.ensureStorageFolder).toHaveBeenCalledWith("system/archive");
  });

  it("throws when storage connection fails", async () => {
    mocks.checkStorageConnection.mockRejectedValue(new Error("Storage down"));

    await expect(bootstrapStorage()).rejects.toThrow("Storage down");
  });
});
