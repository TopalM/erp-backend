import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const originalEnv = { ...process.env };

const loadStorageConfig = async () => {
  vi.resetModules();
  return import("../../src/modules/platform/storage/storage.config.js");
};

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };

  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  process.env.JWT_SECRET = "test-secret";
  process.env.MAIL_HOST = "localhost";
  process.env.MAIL_USER = "test";
  process.env.MAIL_PASSWORD = "test";
  process.env.MAIL_ADDRESS = "test@plastifay.com.tr";
});

afterEach(() => {
  process.env = originalEnv;
  vi.resetModules();
});

describe("storage.config coverage", () => {
  it("normalizes OAuth token prefix", async () => {
    process.env.YANDEX_DISK_TOKEN = "OAuth test-token";
    process.env.FILE_STORAGE_PROVIDER = "YANDEX";
    process.env.FILE_STORAGE_BASE_PATH = "/CustomRoot";
    process.env.FILE_STORAGE_LOCAL_ROOT = "uploads/custom";

    const { storageConfig } = await loadStorageConfig();

    expect(storageConfig.provider).toBe("YANDEX");
    expect(storageConfig.token).toBe("test-token");
    expect(storageConfig.appRoot).toBe("/CustomRoot");
    expect(storageConfig.localRoot).toBe("uploads/custom");
  });

  it("trims token without OAuth prefix", async () => {
    process.env.YANDEX_DISK_TOKEN = "  plain-token  ";

    const { storageConfig } = await loadStorageConfig();

    expect(storageConfig.token).toBe("plain-token");
  });

  it("uses default base path when file storage base path is empty", async () => {
    process.env.FILE_STORAGE_BASE_PATH = "";
    process.env.YANDEX_DISK_BASE_PATH = "/YandexRoot";

    const { storageConfig } = await loadStorageConfig();

    expect(storageConfig.appRoot).toBe("/PlastifayERP");
  });

  it("normalizes missing token to empty string", async () => {
    delete process.env.YANDEX_DISK_TOKEN;

    const { storageConfig } = await loadStorageConfig();

    expect(storageConfig.token).toBe("");
  });
});
