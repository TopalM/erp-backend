import { describe, it, expect, vi } from "vitest";

const setupService = async () => {
  vi.resetModules();

  const findFirstMock = vi.fn();
  const findManyMock = vi.fn();
  const updateMock = vi.fn();

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: {
      document: {
        findFirst: findFirstMock,
        findMany: findManyMock,
        update: updateMock,
      },
    },
  }));

  vi.doMock("../../src/modules/platform/storage/index.js", () => ({
    ensureStorageFolder: vi.fn(),
    buildStoragePath: vi.fn(),
    uploadFile: vi.fn(),
    getDownloadUrl: vi.fn(),
    deleteFile: vi.fn(),
  }));

  const service = await import("../../src/modules/platform/document/document.service.js");

  return {
    ...service,
    findFirstMock,
    findManyMock,
    updateMock,
  };
};

const adminUser = {
  id: "admin-user",
  role: {
    name: "ADMIN",
  },
  userPermissions: [],
};

const superAdminUser = {
  id: "super-admin-user",
  role: {
    name: "SUPER_ADMIN",
  },
  userPermissions: [],
};

const regularUserWithoutPermissions = {
  id: "regular-user",
  role: {
    name: "VIEWER",
  },
  userPermissions: [],
};

const systemDocument = {
  id: "doc-system",
  module: "SYSTEM",
  entityType: "OTHER",
  entityId: "entity-1",
  documentType: "OTHER",
  title: "System Document",
  description: null,
  originalFileName: "safe.pdf",
  storedFileName: "stored-safe.pdf",
  filePath: "secret/internal/path/safe.pdf",
  mimeType: "application/pdf",
  fileExtension: ".pdf",
  sizeBytes: 12,
  storageProvider: "LOCAL",
  uploadedById: "admin-user",
  isActive: true,
  uploadedBy: null,
};

describe("document permission edge security", () => {
  it("allows admin-like user to read document without explicit module permission", async () => {
    const { getDocumentByIdService, findFirstMock } = await setupService();

    findFirstMock.mockResolvedValueOnce(systemDocument);

    const result = await getDocumentByIdService(systemDocument.id, adminUser);

    expect(result.id).toBe(systemDocument.id);
    expect(result).not.toHaveProperty("filePath");
    expect(result).not.toHaveProperty("storageProvider");
  });

  it("allows super admin to delete document without explicit delete permission", async () => {
    const { deactivateDocumentService, findFirstMock, updateMock } = await setupService();

    findFirstMock.mockResolvedValueOnce(systemDocument);
    updateMock.mockResolvedValueOnce({
      ...systemDocument,
      isActive: false,
    });

    const result = await deactivateDocumentService(systemDocument.id, superAdminUser);

    expect(updateMock).toHaveBeenCalledWith({
      where: {
        id: systemDocument.id,
      },
      data: {
        isActive: false,
      },
    });

    expect(result.isActive).toBe(false);
    expect(result).not.toHaveProperty("filePath");
    expect(result).not.toHaveProperty("storageProvider");
  });

  it("does not expose documents in list when user has no read permissions", async () => {
    const { listDocumentsService, findManyMock } = await setupService();

    findManyMock.mockResolvedValueOnce([]);

    const result = await listDocumentsService({}, regularUserWithoutPermissions);

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "__NO_DOCUMENT_ACCESS__",
          isActive: true,
        }),
      }),
    );

    expect(result).toEqual([]);
  });

  it("rejects read access when user lacks module permission", async () => {
    const { getDocumentByIdService, findFirstMock } = await setupService();

    findFirstMock.mockResolvedValueOnce(systemDocument);

    await expect(getDocumentByIdService(systemDocument.id, regularUserWithoutPermissions)).rejects.toMatchObject({
      statusCode: 403,
      message: "Bu dokümana erişim yetkiniz yok.",
    });
  });
});
