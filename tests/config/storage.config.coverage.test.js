import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const defaultEnv = {
  fileStorage: {
    provider: "LOCAL",
    basePath: "/PlastifayERP",
    localRoot: "uploads/test-storage",
  },
  yandexDisk: {
    token: "",
    basePath: "/YandexRoot",
  },
};

const loadStorageConfig = async (envOverrides = {}) => {
  vi.resetModules();

  const mockedEnv = {
    ...defaultEnv,
    ...envOverrides,
    fileStorage: {
      ...defaultEnv.fileStorage,
      ...(envOverrides.fileStorage || {}),
    },
    yandexDisk: {
      ...defaultEnv.yandexDisk,
      ...(envOverrides.yandexDisk || {}),
    },
  };

  vi.doMock("../../src/config/env.js", () => ({
    env: mockedEnv,
  }));

  return import("../../src/modules/platform/storage/storage.config.js");
};

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("storage.config coverage", () => {
  it("normalizes OAuth token prefix", async () => {
    const { storageConfig } = await loadStorageConfig({
      fileStorage: {
        provider: "YANDEX",
        basePath: "/CustomRoot",
        localRoot: "uploads/custom",
      },
      yandexDisk: {
        token: "OAuth test-token",
      },
    });

    expect(storageConfig.provider).toBe("YANDEX");
    expect(storageConfig.token).toBe("test-token");
    expect(storageConfig.appRoot).toBe("/CustomRoot");
    expect(storageConfig.localRoot).toBe("uploads/custom");
  });

  it("trims token without OAuth prefix", async () => {
    const { storageConfig } = await loadStorageConfig({
      yandexDisk: {
        token: "  plain-token  ",
      },
    });

    expect(storageConfig.token).toBe("plain-token");
  });

  it("normalizes missing token to empty string", async () => {
    const { storageConfig } = await loadStorageConfig({
      yandexDisk: {
        token: undefined,
      },
    });

    expect(storageConfig.token).toBe("");
  });

  it("uses file storage base path when it exists", async () => {
    const { storageConfig } = await loadStorageConfig({
      fileStorage: {
        basePath: "/FileStorageRoot",
      },
      yandexDisk: {
        basePath: "/YandexRoot",
      },
    });

    expect(storageConfig.appRoot).toBe("/FileStorageRoot");
  });

  it("falls back to yandex disk base path when file storage base path is empty", async () => {
    const { storageConfig } = await loadStorageConfig({
      fileStorage: {
        basePath: "",
      },
      yandexDisk: {
        basePath: "/YandexRoot",
      },
    });

    expect(storageConfig.appRoot).toBe("/YandexRoot");
  });
});
