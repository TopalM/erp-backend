import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let service;
let prismaMock;
let getDownloadUrlMock;

const admin = {
  id: "admin-1",
  role: { name: "ADMIN" },
  userPermissions: [],
};

const viewerWithoutPerms = {
  id: "viewer-1",
  role: { name: "VIEWER" },
  userPermissions: [],
};

const systemReader = {
  id: "reader-1",
  role: { name: "VIEWER" },
  userPermissions: [
    {
      permission: {
        code: "system_log.read",
      },
    },
  ],
};

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  prismaMock = {
    document: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  };

  getDownloadUrlMock = vi.fn();

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: prismaMock,
  }));

  vi.doMock("../../src/modules/platform/storage/index.js", () => ({
    buildStoragePath: vi.fn(),
    ensureStorageFolder: vi.fn(),
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
    getDownloadUrl: getDownloadUrlMock,
  }));

  service = await import("../../src/modules/platform/document/document.service.js");
});

afterEach(() => {
  vi.doUnmock("../../src/database/prisma.client.js");
  vi.doUnmock("../../src/modules/platform/storage/index.js");
  vi.resetModules();
});

describe("document.service edge coverage", () => {
  it("returns no access scope when user has no document permissions", async () => {
    prismaMock.document.findMany.mockResolvedValue([]);

    const result = await service.listDocumentsService({}, viewerWithoutPerms);

    expect(result).toEqual([]);
    expect(prismaMock.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "__NO_DOCUMENT_ACCESS__",
        }),
      }),
    );
  });

  it("rejects access when document module has no read rule", async () => {
    prismaMock.document.findFirst.mockResolvedValue({
      id: "doc-unknown",
      module: "UNKNOWN_MODULE",
      isActive: true,
      uploadedBy: null,
    });

    await expect(service.getDocumentByIdService("doc-unknown", viewerWithoutPerms)).rejects.toMatchObject({
      statusCode: 403,
      message: "Bu doküman modülü için erişim kuralı tanımlı değil.",
    });
  });

  it("rejects access when user lacks module read permission", async () => {
    prismaMock.document.findFirst.mockResolvedValue({
      id: "doc-system",
      module: "SYSTEM",
      isActive: true,
      uploadedBy: null,
    });

    await expect(service.getDocumentByIdService("doc-system", viewerWithoutPerms)).rejects.toMatchObject({
      statusCode: 403,
      message: "Bu dokümana erişim yetkiniz yok.",
    });
  });

  it("sanitizes uploads download url to file name only", async () => {
    prismaMock.document.findFirst.mockResolvedValue({
      id: "doc-1",
      module: "SYSTEM",
      originalFileName: "safe.pdf",
      mimeType: "application/pdf",
      filePath: "/internal/uploads/storage/PlastifayERP/system/other/entity/safe.pdf",
      isActive: true,
      uploadedBy: null,
    });

    getDownloadUrlMock.mockResolvedValue("/uploads/storage/PlastifayERP/system/other/entity/safe.pdf");

    const result = await service.getDocumentDownloadUrlService("doc-1", admin);

    expect(result).toEqual({
      id: "doc-1",
      fileName: "safe.pdf",
      mimeType: "application/pdf",
      url: "/uploads/safe.pdf",
    });
  });

  it("returns external provider download url as-is", async () => {
    prismaMock.document.findFirst.mockResolvedValue({
      id: "doc-2",
      module: "SYSTEM",
      originalFileName: "safe.pdf",
      mimeType: "application/pdf",
      filePath: "disk:/PlastifayERP/system/safe.pdf",
      isActive: true,
      uploadedBy: null,
    });

    getDownloadUrlMock.mockResolvedValue("https://example.com/download/safe.pdf");

    const result = await service.getDocumentDownloadUrlService("doc-2", admin);

    expect(result.url).toBe("https://example.com/download/safe.pdf");
  });

  it("returns empty download url as-is", async () => {
    prismaMock.document.findFirst.mockResolvedValue({
      id: "doc-3",
      module: "SYSTEM",
      originalFileName: "safe.pdf",
      mimeType: "application/pdf",
      filePath: "disk:/PlastifayERP/system/safe.pdf",
      isActive: true,
      uploadedBy: null,
    });

    getDownloadUrlMock.mockResolvedValue("");

    const result = await service.getDocumentDownloadUrlService("doc-3", admin);

    expect(result.url).toBe("");
  });

  it("returns sanitized document after deactivate", async () => {
    prismaMock.document.findFirst.mockResolvedValue({
      id: "doc-4",
      module: "SYSTEM",
      isActive: true,
      filePath: "/secret/path.pdf",
      storageProvider: "LOCAL",
      uploadedBy: null,
    });

    prismaMock.document.update.mockResolvedValue({
      id: "doc-4",
      module: "SYSTEM",
      isActive: false,
      filePath: "/secret/path.pdf",
      storageProvider: "LOCAL",
      uploadedBy: null,
    });

    const result = await service.deactivateDocumentService("doc-4", admin);

    expect(result.isActive).toBe(false);
    expect(result).not.toHaveProperty("filePath");
    expect(result).not.toHaveProperty("storageProvider");
  });

  it("allows system reader to read system document", async () => {
    prismaMock.document.findFirst.mockResolvedValue({
      id: "doc-5",
      module: "SYSTEM",
      isActive: true,
      filePath: "/secret/path.pdf",
      storageProvider: "LOCAL",
      uploadedBy: null,
    });

    const result = await service.getDocumentByIdService("doc-5", systemReader);

    expect(result.id).toBe("doc-5");
    expect(result).not.toHaveProperty("filePath");
    expect(result).not.toHaveProperty("storageProvider");
  });
});
