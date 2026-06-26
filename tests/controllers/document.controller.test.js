import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = {
  listDocumentsService: vi.fn(),
  getDocumentByIdService: vi.fn(),
  uploadDocumentService: vi.fn(),
  getDocumentDownloadUrlService: vi.fn(),
  deactivateDocumentService: vi.fn(),
};

let controller;

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const testUser = {
  id: "user1",
};

beforeEach(async () => {
  vi.resetModules();
  vi.resetAllMocks();

  vi.doMock("../../src/modules/platform/document/document.service.js", () => mocks);

  controller = await import("../../src/modules/platform/document/document.controller.js");
});

afterEach(() => {
  vi.doUnmock("../../src/modules/platform/document/document.service.js");
  vi.resetModules();
});

describe("document.controller", () => {
  it("lists documents", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.listDocumentsService.mockResolvedValue([{ id: "doc1" }]);

    await controller.listDocuments(
      {
        query: { module: "SYSTEM" },
        user: testUser,
      },
      res,
      next,
    );

    expect(mocks.listDocumentsService).toHaveBeenCalledWith({ module: "SYSTEM" }, testUser);
    expect(res.json).toHaveBeenCalled();
  });

  it("gets document by id", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.getDocumentByIdService.mockResolvedValue({ id: "doc1" });

    await controller.getDocumentById(
      {
        params: { id: "doc1" },
        user: testUser,
      },
      res,
      next,
    );

    expect(mocks.getDocumentByIdService).toHaveBeenCalledWith("doc1", testUser);
    expect(res.json).toHaveBeenCalled();
  });

  it("uploads document", async () => {
    const res = createRes();
    const next = vi.fn();
    const file = { path: "/tmp/test.pdf", originalname: "test.pdf" };

    mocks.uploadDocumentService.mockResolvedValue({ id: "doc1" });

    await controller.uploadDocument(
      {
        body: { module: "SYSTEM" },
        file,
        user: testUser,
      },
      res,
      next,
    );

    expect(mocks.uploadDocumentService).toHaveBeenCalledWith({
      payload: { module: "SYSTEM" },
      file,
      user: testUser,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("gets download url", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.getDocumentDownloadUrlService.mockResolvedValue({ downloadUrl: "url" });

    await controller.getDocumentDownloadUrl(
      {
        params: { id: "doc1" },
        user: testUser,
      },
      res,
      next,
    );

    expect(mocks.getDocumentDownloadUrlService).toHaveBeenCalledWith("doc1", testUser);
    expect(res.json).toHaveBeenCalled();
  });

  it("deletes document", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.deactivateDocumentService.mockResolvedValue({ id: "doc1" });

    await controller.deleteDocument(
      {
        params: { id: "doc1" },
        user: testUser,
      },
      res,
      next,
    );

    expect(mocks.deactivateDocumentService).toHaveBeenCalledWith("doc1", testUser);
    expect(res.json).toHaveBeenCalled();
  });

  it("passes errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("document failed");

    mocks.listDocumentsService.mockRejectedValueOnce(error);

    controller.listDocuments(
      {
        query: {},
        user: testUser,
      },
      res,
      next,
    );
    await flushPromises();

    expect(next).toHaveBeenCalledWith(error);
  });
  it("returns null safely when uploaded document is null", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.uploadDocumentService.mockResolvedValue(null);

    await controller.uploadDocument(
      {
        body: {},
        file: { path: "/tmp/file.pdf" },
        user: testUser,
      },
      res,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Doküman yüklendi.",
      data: null,
    });
  });

  it("returns non-array list response safely", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.listDocumentsService.mockResolvedValue(null);

    await controller.listDocuments({ query: {}, user: testUser }, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Dokümanlar getirildi.",
      data: null,
    });
  });

  it("removes sensitive storage fields from document response", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.getDocumentByIdService.mockResolvedValue({
      id: "doc1",
      title: "Test",
      filePath: "/secret/path/file.pdf",
      storageProvider: "LOCAL",
    });

    await controller.getDocumentById({ params: { id: "doc1" }, user: testUser }, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Doküman getirildi.",
      data: {
        id: "doc1",
        title: "Test",
      },
    });
  });
});
