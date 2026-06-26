import { describe, it, expect, vi, afterEach } from "vitest";

const loadStorageConfig = async ({ provider = "LOCAL", basePath = "/PlastifayERP", localRoot = "/tmp/plastifay-storage", token = "" } = {}) => {
  vi.resetModules();

  vi.doMock("../../src/config/env.js", () => ({
    env: {
      fileStorage: {
        provider,
        basePath,
        localRoot,
      },
      yandexDisk: {
        token,
        basePath,
      },
    },
  }));

  return import("../../src/modules/platform/storage/storage.config.js");
};

afterEach(() => {
  vi.doUnmock("../../src/config/env.js");
  vi.resetModules();
});

describe("storage.config edge cases", () => {
  it("normalizes app root slashes", async () => {
    const { storageConfig } = await loadStorageConfig({
      basePath: "///PlastifayERP//system///",
    });

    expect(storageConfig.appRoot).toBe("/PlastifayERP/system");
  });

  it("falls back to default app root when base path is empty", async () => {
    const { storageConfig } = await loadStorageConfig({
      basePath: "",
    });

    expect(storageConfig.appRoot).toBe("/PlastifayERP");
  });

  it("rejects null byte in base path", async () => {
    await expect(
      loadStorageConfig({
        basePath: "/safe\0bad",
      }),
    ).rejects.toThrow("FILE_STORAGE_BASE_PATH geçersiz.");
  });

  it("rejects path traversal in base path", async () => {
    await expect(
      loadStorageConfig({
        basePath: "/safe/../bad",
      }),
    ).rejects.toThrow("FILE_STORAGE_BASE_PATH geçersiz path segmenti içeriyor.");
  });

  it("rejects invalid characters in base path", async () => {
    await expect(
      loadStorageConfig({
        basePath: "/safe path",
      }),
    ).rejects.toThrow("FILE_STORAGE_BASE_PATH geçersiz path segmenti içeriyor.");
  });

  it("normalizes OAuth token by removing OAuth prefix", async () => {
    const { storageConfig } = await loadStorageConfig({
      provider: "YANDEX",
      token: "OAuth test-token",
    });

    expect(storageConfig.token).toBe("test-token");
  });

  it("requires Yandex token when provider is YANDEX", async () => {
    await expect(
      loadStorageConfig({
        provider: "YANDEX",
        token: "",
      }),
    ).rejects.toThrow("YANDEX_DISK_TOKEN zorunludur.");
  });

  it("rejects unimplemented provider", async () => {
    await expect(
      loadStorageConfig({
        provider: "S3",
      }),
    ).rejects.toThrow("Storage provider implement edilmedi: S3");
  });

  it("rejects empty local root", async () => {
    await expect(
      loadStorageConfig({
        localRoot: "   ",
      }),
    ).rejects.toThrow("FILE_STORAGE_LOCAL_ROOT geçersiz.");
  });
});
