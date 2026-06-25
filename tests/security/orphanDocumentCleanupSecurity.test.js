import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  document: {
    create: vi.fn(),
  },
}));

const storageMocks = vi.hoisted(() => ({
  buildStoragePath: vi.fn(),
  ensureStorageFolder: vi.fn(),
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
}));

const cleanupMocks = vi.hoisted(() => ({
  cleanupLocalFile: vi.fn(),
  cleanupStorageResources: vi.fn(),
}));

let service;

const adminUser = {
  id: "admin1",
  role: { name: "ADMIN" },
  userPermissions: [],
};

const file = {
  path: "/tmp/orphan-document.pdf",
  originalname: "orphan-document.pdf",
  mimetype: "application/pdf",
  size: 1024,
};

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: prismaMock,
  }));

  vi.doMock("../../src/modules/platform/storage/index.js", () => storageMocks);

  vi.doMock("../../src/modules/platform/storage/storage.cleanup.js", () => cleanupMocks);

  service = await import("../../src/modules/platform/document/document.service.js");

  storageMocks.ensureStorageFolder.mockResolvedValue(true);
  storageMocks.buildStoragePath.mockReturnValue("disk:/documents/orphan-document.pdf");
  storageMocks.uploadFile.mockResolvedValue({
    storagePath: "disk:/documents/orphan-document.pdf",
    provider: "YANDEX",
  });
  storageMocks.deleteFile.mockResolvedValue(undefined);

  cleanupMocks.cleanupLocalFile.mockResolvedValue(undefined);
  cleanupMocks.cleanupStorageResources.mockResolvedValue(undefined);
});

describe("orphan document cleanup security", () => {
  it("cleans uploaded storage file when database create fails", async () => {
    prismaMock.document.create.mockRejectedValueOnce(new Error("db create failed"));

    await expect(
      service.uploadDocumentService({
        payload: {
          module: "PURCHASING",
          entityType: "PURCHASE_ORDER",
          entityId: "PO-ORPHAN-001",
          documentType: "OTHER",
          title: "Orphan cleanup test",
        },
        file,
        user: adminUser,
      }),
    ).rejects.toThrow("db create failed");

    expect(storageMocks.uploadFile).toHaveBeenCalledWith({
      localFilePath: file.path,
      storagePath: "disk:/documents/orphan-document.pdf",
      overwrite: true,
    });

    expect(cleanupMocks.cleanupLocalFile).toHaveBeenCalledWith(file.path);

    expect(cleanupMocks.cleanupStorageResources).toHaveBeenCalledWith(["disk:/documents/orphan-document.pdf"], expect.any(Function));
  });
});
