import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const originalProvider = process.env.FILE_STORAGE_PROVIDER;

const makeProvider = (provider) => ({
  provider,
  checkConnection: vi.fn(),
  buildPath: vi.fn(),
  ensureFolder: vi.fn(),
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
  getResourceInfo: vi.fn(),
  resourceExists: vi.fn(),
  getDownloadUrl: vi.fn(),
  moveResource: vi.fn(),
  copyResource: vi.fn(),
  publishResource: vi.fn(),
  unpublishResource: vi.fn(),
});

let localProvider;
let yandexProvider;
let storageService;

const loadService = async (provider = "LOCAL") => {
  vi.resetModules();

  process.env.FILE_STORAGE_PROVIDER = provider;

  localProvider = makeProvider("LOCAL");
  yandexProvider = makeProvider("YANDEX");

  vi.doMock("../../../src/modules/platform/storage/providers/localStorage.service.js", () => localProvider);
  vi.doMock("../../../src/modules/platform/storage/providers/yandexDisk.service.js", () => yandexProvider);

  storageService = await import("../../../src/modules/platform/storage/storage.service.js");
};

beforeEach(async () => {
  vi.clearAllMocks();
  await loadService("LOCAL");
});

afterEach(() => {
  vi.doUnmock("../../../src/modules/platform/storage/providers/localStorage.service.js");
  vi.doUnmock("../../../src/modules/platform/storage/providers/yandexDisk.service.js");

  process.env.FILE_STORAGE_PROVIDER = originalProvider || "LOCAL";
  vi.resetModules();
});

describe("storage.service coverage", () => {
  it("delegates all operations to local provider", async () => {
    localProvider.checkConnection.mockResolvedValue(true);
    localProvider.ensureFolder.mockResolvedValue("folder");
    localProvider.buildPath.mockReturnValue("built/path.txt");
    localProvider.uploadFile.mockResolvedValue({ provider: "LOCAL" });
    localProvider.deleteFile.mockResolvedValue(true);
    localProvider.getResourceInfo.mockResolvedValue({ type: "file" });
    localProvider.resourceExists.mockResolvedValue(true);
    localProvider.getDownloadUrl.mockResolvedValue("/download/file.txt");
    localProvider.moveResource.mockResolvedValue({ moved: true });
    localProvider.copyResource.mockResolvedValue({ copied: true });
    localProvider.publishResource.mockResolvedValue(true);
    localProvider.unpublishResource.mockResolvedValue(true);

    await expect(storageService.checkStorageConnection()).resolves.toBe(true);
    await expect(storageService.ensureStorageFolder("a", "b")).resolves.toBe("folder");
    expect(storageService.buildStoragePath("a", "file.txt")).toBe("built/path.txt");
    await expect(storageService.uploadFile({ storagePath: "x" })).resolves.toEqual({ provider: "LOCAL" });
    await expect(storageService.deleteFile("x")).resolves.toBe(true);
    await expect(storageService.getResourceInfo("x")).resolves.toEqual({ type: "file" });
    await expect(storageService.resourceExists("x")).resolves.toBe(true);
    await expect(storageService.getDownloadUrl("x")).resolves.toBe("/download/file.txt");
    await expect(storageService.moveResource({ fromPath: "a", toPath: "b" })).resolves.toEqual({ moved: true });
    await expect(storageService.copyResource({ fromPath: "a", toPath: "b" })).resolves.toEqual({ copied: true });
    await expect(storageService.publishResource("x")).resolves.toBe(true);
    await expect(storageService.unpublishResource("x")).resolves.toBe(true);

    expect(localProvider.ensureFolder).toHaveBeenCalledWith("a", "b");
    expect(localProvider.buildPath).toHaveBeenCalledWith("a", "file.txt");
  });

  it("delegates to yandex provider", async () => {
    await loadService("YANDEX");

    yandexProvider.checkConnection.mockResolvedValue(true);

    await expect(storageService.checkStorageConnection()).resolves.toBe(true);

    expect(yandexProvider.checkConnection).toHaveBeenCalled();
    expect(localProvider.checkConnection).not.toHaveBeenCalled();
  });

  it("throws for unsupported provider", async () => {
    await loadService("UNSUPPORTED");

    await expect(storageService.checkStorageConnection()).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});
