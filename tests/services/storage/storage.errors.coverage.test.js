import { describe, it, expect } from "vitest";

import { StorageError, normalizeStorageError } from "../../../src/modules/platform/storage/storage.errors.js";

describe("storage.errors coverage", () => {
  it("creates storage error", () => {
    const error = new StorageError("Storage failed", 409);

    expect(error.message).toBe("Storage failed");
    expect(error.statusCode).toBe(409);
  });

  it("normalizes 404", () => {
    expect(normalizeStorageError({ response: { status: 404 } }).statusCode).toBe(404);
  });

  it("normalizes 409", () => {
    expect(normalizeStorageError({ response: { status: 409 } }).statusCode).toBe(409);
  });

  it("normalizes unknown provider error", () => {
    const error = normalizeStorageError({
      message: "Unknown",
      response: {
        status: 500,
        data: {
          message: "Provider failed",
        },
      },
    });

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Provider failed");
  });

  it("normalizes fallback error", () => {
    const error = normalizeStorageError(new Error("Raw failure"));

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Raw failure");
  });
});
