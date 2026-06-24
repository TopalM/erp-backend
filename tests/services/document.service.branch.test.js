import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  document: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}));

const storageMocks = vi.hoisted(() => ({
  buildStoragePath: vi.fn(),
  ensureStorageFolder: vi.fn(),
  uploadFile: vi.fn(),
  getDownloadUrl: vi.fn(),
}));

const cleanupMocks = vi.hoisted(() => ({
  cleanupLocalFile: vi.fn(),
}));

let service;

const file = {
  path: "/tmp/test-document.pdf",
  originalname: "Test Document.pdf",
  mimetype: "application/pdf",
  size: 1234,
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
  storageMocks.buildStoragePath.mockReturnValue("disk:/documents/test-document.pdf");
  storageMocks.uploadFile.mockResolvedValue({
    storagePath: "disk:/documents/test-document.pdf",
    provider: "YANDEX",
  });
  storageMocks.getDownloadUrl.mockResolvedValue("https://download.test/document.pdf");
  cleanupMocks.cleanupLocalFile.mockResolvedValue(undefined);

  prismaMock.document.create.mockImplementation(async ({ data }) => ({
    id: "doc1",
    isActive: true,
    ...data,
  }));

  prismaMock.document.findMany.mockResolvedValue([]);

  prismaMock.document.findFirst.mockResolvedValue({
    id: "doc1",
    isActive: true,
    originalFileName: "Test Document.pdf",
    filePath: "disk:/documents/test-document.pdf",
    mimeType: "application/pdf",
  });

  prismaMock.document.update.mockImplementation(async ({ where, data }) => ({
    id: where.id,
    ...data,
  }));
});

describe("document.service branch coverage", () => {
  it("uploads document with fallback documentType title and nullable metadata", async () => {
    const result = await service.uploadDocumentService({
      payload: {
        module: "PURCHASING",
        entityType: "PURCHASE_ORDER",
        entityId: "PO 001",
      },
      file: {
        ...file,
        mimetype: "",
        size: 0,
      },
      userId: null,
    });

    expect(storageMocks.ensureStorageFolder).toHaveBeenCalledTimes(3);
    expect(storageMocks.buildStoragePath).toHaveBeenCalled();
    expect(storageMocks.uploadFile).toHaveBeenCalledWith({
      localFilePath: file.path,
      storagePath: "disk:/documents/test-document.pdf",
      overwrite: true,
    });

    expect(prismaMock.document.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        module: "PURCHASING",
        entityType: "PURCHASE_ORDER",
        entityId: "PO 001",
        documentType: "OTHER",
        title: "Test Document.pdf",
        description: null,
        mimeType: null,
        sizeBytes: null,
        uploadedById: null,
      }),
    });

    expect(cleanupMocks.cleanupLocalFile).toHaveBeenCalledWith(file.path);
    expect(result.id).toBe("doc1");
  });

  it("throws when file is missing", async () => {
    await expect(
      service.uploadDocumentService({
        payload: {
          module: "PURCHASING",
          entityType: "PURCHASE_ORDER",
          entityId: "PO001",
        },
        file: null,
        userId: "user1",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("cleans local file even when upload fails", async () => {
    storageMocks.uploadFile.mockRejectedValueOnce(new Error("upload failed"));

    await expect(
      service.uploadDocumentService({
        payload: {
          module: "PURCHASING",
          entityType: "PURCHASE_ORDER",
          entityId: "PO001",
        },
        file,
        userId: "user1",
      }),
    ).rejects.toThrow("upload failed");

    expect(cleanupMocks.cleanupLocalFile).toHaveBeenCalledWith(file.path);
    expect(prismaMock.document.create).not.toHaveBeenCalled();
  });

  it("lists documents with all filters", async () => {
    await service.listDocumentsService({
      module: "PURCHASING",
      entityType: "PURCHASE_ORDER",
      entityId: "PO001",
      documentType: "INVOICE",
    });

    expect(prismaMock.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isActive: true,
          module: "PURCHASING",
          entityType: "PURCHASE_ORDER",
          entityId: "PO001",
          documentType: "INVOICE",
        },
      }),
    );
  });

  it("throws for invalid list enum filters", async () => {
    await expect(
      service.listDocumentsService({
        module: "INVALID",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws when document not found", async () => {
    prismaMock.document.findFirst.mockResolvedValueOnce(null);

    await expect(service.getDocumentByIdService("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("gets document download url", async () => {
    const result = await service.getDocumentDownloadUrlService("doc1");

    expect(storageMocks.getDownloadUrl).toHaveBeenCalledWith("disk:/documents/test-document.pdf");
    expect(result).toEqual({
      id: "doc1",
      fileName: "Test Document.pdf",
      mimeType: "application/pdf",
      url: "https://download.test/document.pdf",
    });
  });

  it("deactivates document", async () => {
    await service.deactivateDocumentService("doc1");

    expect(prismaMock.document.update).toHaveBeenCalledWith({
      where: {
        id: "doc1",
      },
      data: {
        isActive: false,
      },
    });
  });
});
