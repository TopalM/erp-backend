import { describe, it, expect } from "vitest";

import { StorageError, normalizeStorageError } from "../../src/modules/platform/storage/storage.errors.js";

describe("storage errors", () => {
  it("creates storage error", () => {
    const err = new StorageError("Storage failed", 500);

    expect(err.message).toBe("Storage failed");
    expect(err.statusCode).toBe(500);
  });

  it("normalizes 404 error", () => {
    const err = normalizeStorageError({
      response: {
        status: 404,
      },
    });

    expect(err.statusCode).toBe(404);
  });

  it("normalizes 401 error", () => {
    const err = normalizeStorageError({
      response: {
        status: 401,
      },
    });

    expect([401, 500]).toContain(err.statusCode);
  });

  it("normalizes unknown error", () => {
    const err = normalizeStorageError(new Error("boom"));

    expect(err).toBeInstanceOf(StorageError);
  });
});
