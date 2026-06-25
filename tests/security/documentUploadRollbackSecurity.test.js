import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const createTempFile = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "document-rollback-"));
  const filePath = path.join(dir, "safe.pdf");

  await fs.writeFile(filePath, "%PDF-1.4\n%%EOF\n");

  return { dir, filePath };
};

const user = {
  id: "user-1",
  role: {
    name: "ADMIN",
  },
  userPermissions: [],
};

const payload = {
  module: "SYSTEM",
  entityType: "OTHER",
  entityId: "rollback-entity",
  documentType: "OTHER",
  title: "Rollback Security",
};

const setupService = async () => {
  vi.resetModules();

  const prismaCreateMock = vi.fn();
  const uploadFileMock = vi.fn();
  const deleteFileMock = vi.fn();
  const cleanupLocalFileMock = vi.fn();
  const cleanupStorageResourcesMock = vi.fn(async (resources, deleteFunction) => {
    for (const resource of resources) {
      await deleteFunction(resource);
    }
  });

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: {
      document: {
        create: prismaCreateMock,
      },
    },
  }));

  vi.doMock("../../src/modules/platform/storage/index.js", () => ({
    ensureStorageFolder: vi.fn(),
    buildStoragePath: vi.fn(() => "mock/storage/path/safe.pdf"),
    uploadFile: uploadFileMock,
    getDownloadUrl: vi.fn(),
    deleteFile: deleteFileMock,
  }));

  vi.doMock("../../src/modules/platform/storage/storage.cleanup.js", () => ({
    cleanupLocalFile: cleanupLocalFileMock,
    cleanupStorageResources: cleanupStorageResourcesMock,
  }));

  const { uploadDocumentService } = await import("../../src/modules/platform/document/document.service.js");

  return {
    uploadDocumentService,
    prismaCreateMock,
    uploadFileMock,
    deleteFileMock,
    cleanupLocalFileMock,
    cleanupStorageResourcesMock,
  };
};

describe("document upload rollback security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cleans uploaded storage resource when database create fails", async () => {
    const { uploadDocumentService, prismaCreateMock, uploadFileMock, deleteFileMock, cleanupLocalFileMock, cleanupStorageResourcesMock } =
      await setupService();

    const { dir, filePath } = await createTempFile();

    uploadFileMock.mockResolvedValueOnce({
      storagePath: "mock/storage/path/safe.pdf",
      provider: "LOCAL",
    });

    prismaCreateMock.mockRejectedValueOnce(new Error("database create failed"));

    await expect(
      uploadDocumentService({
        payload,
        file: {
          path: filePath,
          originalname: "safe.pdf",
          mimetype: "application/pdf",
          size: 12,
        },
        user,
      }),
    ).rejects.toThrow("database create failed");

    expect(uploadFileMock).toHaveBeenCalledOnce();

    expect(cleanupStorageResourcesMock).toHaveBeenCalledWith(["mock/storage/path/safe.pdf"], expect.any(Function));

    expect(deleteFileMock).toHaveBeenCalledWith("mock/storage/path/safe.pdf");
    expect(cleanupLocalFileMock).toHaveBeenCalledWith(filePath);

    await fs.rm(dir, {
      recursive: true,
      force: true,
    });
  });

  it("cleans temp file when storage upload fails before database create", async () => {
    const { uploadDocumentService, prismaCreateMock, uploadFileMock, cleanupLocalFileMock, cleanupStorageResourcesMock } = await setupService();

    const { dir, filePath } = await createTempFile();

    uploadFileMock.mockRejectedValueOnce(new Error("storage upload failed"));

    await expect(
      uploadDocumentService({
        payload,
        file: {
          path: filePath,
          originalname: "safe.pdf",
          mimetype: "application/pdf",
          size: 12,
        },
        user,
      }),
    ).rejects.toThrow("storage upload failed");

    expect(prismaCreateMock).not.toHaveBeenCalled();
    expect(cleanupStorageResourcesMock).not.toHaveBeenCalled();
    expect(cleanupLocalFileMock).toHaveBeenCalledWith(filePath);

    await fs.rm(dir, {
      recursive: true,
      force: true,
    });
  });
});
