import { describe, it, expect } from "vitest";

import { normalizeStorageError, StorageError } from "../../../src/modules/platform/storage/storage.errors.js";

describe("storage.errors edge cases", () => {
  it("creates StorageError with defaults", () => {
    const error = new StorageError();

    expect(error.name).toBe("StorageError");
    expect(error.message).toBe("Storage işlemi sırasında hata oluştu.");
    expect(error.statusCode).toBe(500);
  });

  it("normalizes 401 as authorization error", () => {
    const error = normalizeStorageError({
      response: {
        status: 401,
      },
    });

    expect(error).toBeInstanceOf(StorageError);
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Storage yetkilendirme hatası.");
  });

  it("normalizes 403 as authorization error", () => {
    const error = normalizeStorageError({
      response: {
        status: 403,
      },
    });

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Storage yetkilendirme hatası.");
  });

  it("normalizes 404 as not found", () => {
    const error = normalizeStorageError({
      response: {
        status: 404,
      },
    });

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Storage kaynağı bulunamadı.");
  });

  it("normalizes 409 as conflict", () => {
    const error = normalizeStorageError({
      response: {
        status: 409,
      },
    });

    expect(error.statusCode).toBe(409);
    expect(error.message).toBe("Storage kaynağı zaten mevcut.");
  });

  it("normalizes 507 as storage capacity error", () => {
    const error = normalizeStorageError({
      response: {
        status: 507,
      },
    });

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Storage üzerinde yeterli alan bulunmuyor.");
  });

  it("uses provider message when available", () => {
    const error = normalizeStorageError({
      response: {
        status: 500,
        data: {
          message: "Provider message",
        },
      },
    });

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Provider message");
  });

  it("uses provider description when message is missing", () => {
    const error = normalizeStorageError({
      response: {
        status: 500,
        data: {
          description: "Provider description",
        },
      },
    });

    expect(error.message).toBe("Provider description");
  });

  it("uses error message when provider message is missing", () => {
    const error = normalizeStorageError(new Error("Raw storage error"));

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Raw storage error");
  });

  it("uses fallback message when no details exist", () => {
    const error = normalizeStorageError({}, "Fallback storage error");

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Fallback storage error");
  });
});
