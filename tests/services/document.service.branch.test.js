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
  deleteFile: vi.fn(),
}));

const cleanupMocks = vi.hoisted(() => ({
  cleanupLocalFile: vi.fn(),
  cleanupStorageResources: vi.fn(),
}));

let service;

const file = {
  path: "/tmp/test-document.pdf",
  originalname: "Test Document.pdf",
  mimetype: "application/pdf",
  size: 1234,
};

const adminUser = {
  id: "user1",
  role: {
    name: "ADMIN",
  },
  userPermissions: [],
};

const noPermissionUser = {
  id: "user2",
  role: {
    name: "VIEWER",
  },
  userPermissions: [],
};

const purchaseReadUser = {
  id: "user3",
  role: {
    name: "VIEWER",
  },
  userPermissions: [
    {
      permission: {
        code: "purchase.read",
      },
    },
  ],
};

const purchaseCreateUser = {
  id: "user4",
  role: {
    name: "VIEWER",
  },
  userPermissions: [
    {
      permission: {
        code: "purchase.create",
      },
    },
  ],
};

const multiModuleReadUser = {
  id: "user5",
  role: {
    name: "VIEWER",
  },
  userPermissions: [
    {
      permission: {
        code: "purchase.read",
      },
    },
    {
      permission: {
        code: "quality.read",
      },
    },
  ],
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
  storageMocks.deleteFile.mockResolvedValue(undefined);

  cleanupMocks.cleanupLocalFile.mockResolvedValue(undefined);
  cleanupMocks.cleanupStorageResources.mockResolvedValue(undefined);

  prismaMock.document.create.mockImplementation(async ({ data }) => ({
    id: "doc1",
    isActive: true,
    ...data,
  }));

  prismaMock.document.findMany.mockResolvedValue([]);

  prismaMock.document.findFirst.mockResolvedValue({
    id: "doc1",
    isActive: true,
    module: "PURCHASING",
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
      user: adminUser,
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
        uploadedById: "user1",
      }),
    });

    expect(cleanupMocks.cleanupLocalFile).toHaveBeenCalledWith(file.path);
    expect(result.id).toBe("doc1");
  });

  it("uploads document when user has module create permission", async () => {
    const result = await service.uploadDocumentService({
      payload: {
        module: "PURCHASING",
        entityType: "PURCHASE_ORDER",
        entityId: "PO002",
        documentType: "OTHER",
      },
      file,
      user: purchaseCreateUser,
    });

    expect(result.id).toBe("doc1");
    expect(prismaMock.document.create).toHaveBeenCalled();
  });

  it("rejects document upload when user lacks module create permission", async () => {
    await expect(
      service.uploadDocumentService({
        payload: {
          module: "PURCHASING",
          entityType: "PURCHASE_ORDER",
          entityId: "PO003",
          documentType: "OTHER",
        },
        file,
        user: noPermissionUser,
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "Bu modüle doküman yükleme yetkiniz yok.",
    });

    expect(storageMocks.uploadFile).not.toHaveBeenCalled();
    expect(cleanupMocks.cleanupLocalFile).not.toHaveBeenCalled();
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
        user: adminUser,
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
        user: adminUser,
      }),
    ).rejects.toThrow("upload failed");

    expect(cleanupMocks.cleanupLocalFile).toHaveBeenCalledWith(file.path);
    expect(prismaMock.document.create).not.toHaveBeenCalled();
  });

  it("lists documents with all filters", async () => {
    await service.listDocumentsService(
      {
        module: "PURCHASING",
        entityType: "PURCHASE_ORDER",
        entityId: "PO001",
        documentType: "INVOICE",
      },
      adminUser,
    );

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

  it("scopes document list to modules the user can read", async () => {
    await service.listDocumentsService({}, multiModuleReadUser);

    expect(prismaMock.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isActive: true,
          module: {
            in: ["PURCHASING", "QUALITY"],
          },
        },
      }),
    );
  });

  it("returns no-access where clause when user has no module read permission", async () => {
    await service.listDocumentsService({}, noPermissionUser);

    expect(prismaMock.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isActive: true,
          id: "__NO_DOCUMENT_ACCESS__",
        },
      }),
    );
  });

  it("throws for invalid list enum filters", async () => {
    await expect(
      service.listDocumentsService(
        {
          module: "INVALID",
        },
        adminUser,
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws when document not found", async () => {
    prismaMock.document.findFirst.mockResolvedValueOnce(null);

    await expect(service.getDocumentByIdService("missing", adminUser)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("allows document detail when user has module read permission", async () => {
    const result = await service.getDocumentByIdService("doc1", purchaseReadUser);

    expect(result.id).toBe("doc1");
  });

  it("rejects document detail when user lacks module read permission", async () => {
    await expect(service.getDocumentByIdService("doc1", noPermissionUser)).rejects.toMatchObject({
      statusCode: 403,
      message: "Bu dokümana erişim yetkiniz yok.",
    });
  });

  it("throws when document module has no access rule", async () => {
    prismaMock.document.findFirst.mockResolvedValueOnce({
      id: "doc-unknown-module",
      isActive: true,
      module: "UNKNOWN_MODULE",
      originalFileName: "Unknown.pdf",
      filePath: "disk:/documents/unknown.pdf",
      mimeType: "application/pdf",
    });

    await expect(service.getDocumentByIdService("doc-unknown-module", noPermissionUser)).rejects.toMatchObject({
      statusCode: 403,
      message: "Bu doküman modülü için erişim kuralı tanımlı değil.",
    });
  });

  it("gets document download url", async () => {
    const result = await service.getDocumentDownloadUrlService("doc1", adminUser);

    expect(storageMocks.getDownloadUrl).toHaveBeenCalledWith("disk:/documents/test-document.pdf");
    expect(result).toEqual({
      id: "doc1",
      fileName: "Test Document.pdf",
      mimeType: "application/pdf",
      url: "https://download.test/document.pdf",
    });
  });

  it("deactivates document", async () => {
    await service.deactivateDocumentService("doc1", adminUser);

    expect(prismaMock.document.update).toHaveBeenCalledWith({
      where: {
        id: "doc1",
      },
      data: {
        isActive: false,
      },
    });
  });

  it("cleans storage file and local file when database create fails after storage upload", async () => {
    prismaMock.document.create.mockRejectedValueOnce(new Error("db create failed"));

    await expect(
      service.uploadDocumentService({
        payload: {
          module: "PURCHASING",
          entityType: "PURCHASE_ORDER",
          entityId: "PO001",
          documentType: "OTHER",
        },
        file,
        user: adminUser,
      }),
    ).rejects.toThrow("db create failed");

    expect(storageMocks.uploadFile).toHaveBeenCalled();

    expect(cleanupMocks.cleanupStorageResources).toHaveBeenCalledWith(["disk:/documents/test-document.pdf"], expect.any(Function));

    expect(cleanupMocks.cleanupLocalFile).toHaveBeenCalledWith(file.path);
  });

  it("does not expose public/publish url, only provider download url", async () => {
    const result = await service.getDocumentDownloadUrlService("doc1", adminUser);

    expect(storageMocks.getDownloadUrl).toHaveBeenCalledWith("disk:/documents/test-document.pdf");
    expect(result.url).toBe("https://download.test/document.pdf");
    expect(result).not.toHaveProperty("publicUrl");
    expect(result).not.toHaveProperty("publishedUrl");
  });

  it("creates unpredictable stored file name with timestamp and random suffix", async () => {
    await service.uploadDocumentService({
      payload: {
        module: "PURCHASING",
        entityType: "PURCHASE_ORDER",
        entityId: "PO001",
        documentType: "OTHER",
      },
      file,
      user: adminUser,
    });

    expect(prismaMock.document.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        storedFileName: expect.stringMatching(/^\d+-\d+-Test[ -]Document\.pdf$/),
      }),
    });
  });

  it("does not try storage cleanup when upload fails before storage path exists", async () => {
    storageMocks.uploadFile.mockRejectedValueOnce(new Error("upload failed"));

    await expect(
      service.uploadDocumentService({
        payload: {
          module: "PURCHASING",
          entityType: "PURCHASE_ORDER",
          entityId: "PO001",
          documentType: "OTHER",
        },
        file,
        user: adminUser,
      }),
    ).rejects.toThrow("upload failed");

    expect(cleanupMocks.cleanupStorageResources).not.toHaveBeenCalled();
    expect(cleanupMocks.cleanupLocalFile).toHaveBeenCalledWith(file.path);
  });

  it("throws when document create module has no access rule", async () => {
    await expect(
      service.uploadDocumentService({
        payload: {
          module: "UNKNOWN_MODULE",
          entityType: "OTHER",
          entityId: "unknown-1",
          documentType: "OTHER",
        },
        file,
        user: noPermissionUser,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });

    expect(storageMocks.uploadFile).not.toHaveBeenCalled();
  });

  it("throws when document create access rule is missing", async () => {
    await expect(
      service.uploadDocumentService({
        payload: {
          module: "UTILITY",
          entityType: "UTILITY_READING",
          entityId: "utility-1",
          documentType: "UTILITY_REPORT",
        },
        file,
        user: noPermissionUser,
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
    });

    expect(storageMocks.uploadFile).not.toHaveBeenCalled();
  });
});
