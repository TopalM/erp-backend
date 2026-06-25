import { describe, it, expect, vi, beforeEach } from "vitest";

const storageMocks = vi.hoisted(() => ({
  buildStoragePath: vi.fn(),
  ensureStorageFolder: vi.fn(),
  uploadFile: vi.fn(),
  getDownloadUrl: vi.fn(),
  publishResource: vi.fn(),
  unpublishResource: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  document: {
    findFirst: vi.fn(),
  },
}));

let documentService;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  vi.doMock("../../src/modules/platform/storage/index.js", () => storageMocks);

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: prismaMock,
  }));

  documentService = await import("../../src/modules/platform/document/document.service.js");

  prismaMock.document.findFirst.mockResolvedValue({
    id: "doc1",
    isActive: true,
    module: "SYSTEM",
    entityType: "OTHER",
    entityId: "entity1",
    documentType: "OTHER",
    originalFileName: "secure.pdf",
    filePath: "system/other/entity1/secure.pdf",
    mimeType: "application/pdf",
  });

  storageMocks.getDownloadUrl.mockResolvedValue("/uploads/secure.pdf");
});

describe("yandex publish security", () => {
  it("document download url flow does not publish storage resource", async () => {
    const adminUser = {
      id: "admin1",
      role: { name: "ADMIN" },
      userPermissions: [],
    };

    const result = await documentService.getDocumentDownloadUrlService("doc1", adminUser);

    expect(result.url).toBe("/uploads/secure.pdf");
    expect(storageMocks.getDownloadUrl).toHaveBeenCalledWith("system/other/entity1/secure.pdf");
    expect(storageMocks.publishResource).not.toHaveBeenCalled();
    expect(storageMocks.unpublishResource).not.toHaveBeenCalled();
  });
});
