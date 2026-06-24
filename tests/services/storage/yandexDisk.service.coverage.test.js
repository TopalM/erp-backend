import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let axios;
let yandex;
let createReadStreamSpy;

const storageClientMock = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

const tempFilePath = path.join(os.tmpdir(), "yandex-upload-test.txt");

const yandexError = (status, error = "Error", message = "error") => ({
  response: {
    status,
    data: {
      error,
      message,
      description: message,
    },
  },
  message,
});

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.useRealTimers();

  vi.doMock("axios", () => ({
    default: {
      put: vi.fn(),
      create: vi.fn(() => storageClientMock),
    },
  }));

  vi.doMock("../../../src/modules/platform/storage/storage.client.js", () => ({
    storageClient: storageClientMock,
  }));

  vi.doMock("../../../src/modules/platform/storage/storage.config.js", () => ({
    storageConfig: {
      appRoot: "PlastifayERPTest",
      baseUrl: "https://cloud-api.yandex.net/v1/disk",
      token: "test-token",
    },
  }));

  axios = (await import("axios")).default;
  yandex = await import("../../../src/modules/platform/storage/providers/yandexDisk.service.js");

  fs.writeFileSync(tempFilePath, "test-file");

  createReadStreamSpy = vi.spyOn(fs, "createReadStream").mockReturnValue("mock-file-stream");

  storageClientMock.get.mockResolvedValue({ data: {} });
  storageClientMock.put.mockResolvedValue({ data: {} });
  storageClientMock.post.mockResolvedValue({ data: {} });
  storageClientMock.delete.mockResolvedValue({ data: {} });
  axios.put.mockResolvedValue({ data: {} });
});

afterEach(() => {
  vi.useRealTimers();
  createReadStreamSpy?.mockRestore();

  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }

  vi.doUnmock("axios");
  vi.doUnmock("../../../src/modules/platform/storage/storage.client.js");
  vi.doUnmock("../../../src/modules/platform/storage/storage.config.js");
});

describe("yandexDisk.service coverage", () => {
  it("builds normalized disk path", () => {
    expect(yandex.buildPath("/users/", " profile-photos ", "/file.pdf")).toBe("disk:/PlastifayERPTest/users/profile-photos/file.pdf");
  });

  it("checks connection", async () => {
    storageClientMock.get.mockResolvedValueOnce({ data: { total_space: 100 } });

    const result = await yandex.checkConnection();

    expect(storageClientMock.get).toHaveBeenCalledWith("/");
    expect(result).toEqual({ total_space: 100 });
  });

  it("throws normalized error when connection fails", async () => {
    storageClientMock.get.mockRejectedValueOnce(yandexError(401, "UnauthorizedError", "unauthorized"));

    await expect(yandex.checkConnection()).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("gets resource info", async () => {
    storageClientMock.get.mockResolvedValueOnce({
      data: {
        path: "disk:/PlastifayERPTest/file.pdf",
        type: "file",
      },
    });

    const result = await yandex.getResourceInfo("disk:/PlastifayERPTest/file.pdf");

    expect(storageClientMock.get).toHaveBeenCalledWith("/resources", {
      params: {
        path: "disk:/PlastifayERPTest/file.pdf",
      },
    });
    expect(result.type).toBe("file");
  });

  it("returns true when resource exists", async () => {
    storageClientMock.get.mockResolvedValueOnce({ data: { path: "disk:/x" } });

    await expect(yandex.resourceExists("disk:/x")).resolves.toBe(true);
  });

  it("returns false when resource does not exist", async () => {
    storageClientMock.get.mockRejectedValueOnce(yandexError(404, "DiskNotFoundError", "not found"));

    await expect(yandex.resourceExists("disk:/missing")).resolves.toBe(false);
  });

  it("rethrows non-404 resourceExists errors", async () => {
    storageClientMock.get.mockRejectedValueOnce(yandexError(403, "ForbiddenError", "forbidden"));

    await expect(yandex.resourceExists("disk:/forbidden")).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("ensures nested folders and ignores existing folders", async () => {
    storageClientMock.put.mockRejectedValueOnce(yandexError(409, "DiskPathPointsToExistentDirectoryError", "exists"));

    const result = await yandex.ensureFolder("users", "photos");

    expect(result).toBe("disk:/PlastifayERPTest/users/photos");
    expect(storageClientMock.put).toHaveBeenCalledTimes(3);
  });

  it("retries temporary folder creation error", async () => {
    vi.useFakeTimers();

    storageClientMock.put
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(yandexError(423, "DiskResourceLockedError", "locked"))
      .mockResolvedValueOnce({ data: {} });

    const promise = yandex.ensureFolder("users");

    await vi.advanceTimersByTimeAsync(500);

    await expect(promise).resolves.toBe("disk:/PlastifayERPTest/users");
    expect(storageClientMock.put).toHaveBeenCalledTimes(3);
  });

  it("throws normalized folder creation error after non-temporary failure", async () => {
    storageClientMock.put.mockRejectedValueOnce(yandexError(403, "ForbiddenError", "forbidden"));

    await expect(yandex.ensureFolder("users")).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("uploads file with overwrite delete and upload link", async () => {
    storageClientMock.delete.mockResolvedValueOnce({ data: {} });
    storageClientMock.get.mockResolvedValueOnce({
      data: {
        href: "https://upload.yandex.test/file",
      },
    });

    const result = await yandex.uploadFile({
      localFilePath: tempFilePath,
      storagePath: "disk:/PlastifayERPTest/file.txt",
      overwrite: true,
    });

    expect(storageClientMock.delete).toHaveBeenCalledWith("/resources", {
      params: {
        path: "disk:/PlastifayERPTest/file.txt",
        permanently: true,
      },
    });

    expect(storageClientMock.get).toHaveBeenCalledWith("/resources/upload", {
      params: {
        path: "disk:/PlastifayERPTest/file.txt",
        overwrite: "true",
      },
    });

    expect(axios.put).toHaveBeenCalledWith(
      "https://upload.yandex.test/file",
      expect.anything(),
      expect.objectContaining({
        headers: {
          "Content-Type": "application/octet-stream",
        },
      }),
    );

    expect(result).toEqual({
      storagePath: "disk:/PlastifayERPTest/file.txt",
      fileName: "file.txt",
      provider: "YANDEX",
    });
  });

  it("uploads without overwrite", async () => {
    storageClientMock.get.mockResolvedValueOnce({
      data: {
        href: "https://upload.yandex.test/file",
      },
    });

    await yandex.uploadFile({
      localFilePath: tempFilePath,
      storagePath: "disk:/PlastifayERPTest/file.txt",
      overwrite: false,
    });

    expect(storageClientMock.delete).not.toHaveBeenCalled();
    expect(storageClientMock.get).toHaveBeenCalledWith("/resources/upload", {
      params: {
        path: "disk:/PlastifayERPTest/file.txt",
        overwrite: "false",
      },
    });
  });

  it("throws when local upload file is missing", async () => {
    await expect(
      yandex.uploadFile({
        localFilePath: "/tmp/not-existing-yandex-file.txt",
        storagePath: "disk:/PlastifayERPTest/missing.txt",
      }),
    ).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("retries temporary upload link error", async () => {
    vi.useFakeTimers();

    storageClientMock.delete.mockResolvedValueOnce({ data: {} });
    storageClientMock.get.mockRejectedValueOnce(yandexError(429, "TooManyRequestsError", "too many requests")).mockResolvedValueOnce({
      data: {
        href: "https://upload.yandex.test/file",
      },
    });

    const promise = yandex.uploadFile({
      localFilePath: tempFilePath,
      storagePath: "disk:/PlastifayERPTest/file.txt",
      overwrite: true,
    });

    await vi.advanceTimersByTimeAsync(500);

    await expect(promise).resolves.toMatchObject({
      provider: "YANDEX",
    });

    expect(storageClientMock.get).toHaveBeenCalledTimes(2);
  });

  it("retries temporary binary upload error", async () => {
    vi.useFakeTimers();

    storageClientMock.delete.mockResolvedValueOnce({ data: {} });
    storageClientMock.get.mockResolvedValueOnce({
      data: {
        href: "https://upload.yandex.test/file",
      },
    });

    axios.put.mockRejectedValueOnce(yandexError(423, "DiskResourceLockedError", "locked")).mockResolvedValueOnce({ data: {} });

    const promise = yandex.uploadFile({
      localFilePath: tempFilePath,
      storagePath: "disk:/PlastifayERPTest/file.txt",
      overwrite: true,
    });

    await vi.advanceTimersByTimeAsync(500);

    await expect(promise).resolves.toMatchObject({
      provider: "YANDEX",
    });

    expect(axios.put).toHaveBeenCalledTimes(2);
  });

  it("deletes file", async () => {
    await expect(yandex.deleteFile("disk:/PlastifayERPTest/file.txt")).resolves.toBe(true);

    expect(storageClientMock.delete).toHaveBeenCalledWith("/resources", {
      params: {
        path: "disk:/PlastifayERPTest/file.txt",
        permanently: true,
      },
    });
  });

  it("deleteFile returns true when path is empty", async () => {
    await expect(yandex.deleteFile()).resolves.toBe(true);
    expect(storageClientMock.delete).not.toHaveBeenCalled();
  });

  it("deleteFile ignores 404", async () => {
    storageClientMock.delete.mockRejectedValueOnce(yandexError(404, "DiskNotFoundError", "not found"));

    await expect(yandex.deleteFile("disk:/missing")).resolves.toBe(true);
  });

  it("deleteFile retries temporary errors", async () => {
    vi.useFakeTimers();

    storageClientMock.delete.mockRejectedValueOnce(yandexError(423, "DiskResourceLockedError", "locked")).mockResolvedValueOnce({ data: {} });

    const promise = yandex.deleteFile("disk:/locked");

    await vi.advanceTimersByTimeAsync(500);

    await expect(promise).resolves.toBe(true);
    expect(storageClientMock.delete).toHaveBeenCalledTimes(2);
  });

  it("deleteFile throws normalized non-temporary error", async () => {
    storageClientMock.delete.mockRejectedValueOnce(yandexError(403, "ForbiddenError", "forbidden"));

    await expect(yandex.deleteFile("disk:/forbidden")).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it("gets download url", async () => {
    storageClientMock.get.mockResolvedValueOnce({
      data: {
        href: "https://download.yandex.test/file",
      },
    });

    await expect(yandex.getDownloadUrl("disk:/file")).resolves.toBe("https://download.yandex.test/file");

    expect(storageClientMock.get).toHaveBeenCalledWith("/resources/download", {
      params: {
        path: "disk:/file",
      },
    });
  });

  it("moves resource", async () => {
    await expect(
      yandex.moveResource({
        fromPath: "disk:/old.txt",
        toPath: "disk:/new.txt",
        overwrite: false,
      }),
    ).resolves.toEqual({
      fromPath: "disk:/old.txt",
      toPath: "disk:/new.txt",
    });

    expect(storageClientMock.post).toHaveBeenCalledWith("/resources/move", null, {
      params: {
        from: "disk:/old.txt",
        path: "disk:/new.txt",
        overwrite: false,
      },
    });
  });

  it("copies resource", async () => {
    await expect(
      yandex.copyResource({
        fromPath: "disk:/old.txt",
        toPath: "disk:/copy.txt",
      }),
    ).resolves.toEqual({
      fromPath: "disk:/old.txt",
      toPath: "disk:/copy.txt",
    });

    expect(storageClientMock.post).toHaveBeenCalledWith("/resources/copy", null, {
      params: {
        from: "disk:/old.txt",
        path: "disk:/copy.txt",
        overwrite: true,
      },
    });
  });

  it("publishes resource", async () => {
    await expect(yandex.publishResource("disk:/file.txt")).resolves.toBe(true);

    expect(storageClientMock.put).toHaveBeenCalledWith("/resources/publish", null, {
      params: {
        path: "disk:/file.txt",
      },
    });
  });

  it("unpublishes resource", async () => {
    await expect(yandex.unpublishResource("disk:/file.txt")).resolves.toBe(true);

    expect(storageClientMock.put).toHaveBeenCalledWith("/resources/unpublish", null, {
      params: {
        path: "disk:/file.txt",
      },
    });
  });
});
