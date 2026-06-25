import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const minimalPdfContent = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n");

const createDocumentUser = () =>
  createTestUser({
    permissions: [PERMISSIONS.DOCUMENT_CREATE, PERMISSIONS.DOCUMENT_READ, PERMISSIONS.DOCUMENT_DOWNLOAD, PERMISSIONS.SYSTEM_LOG_READ].filter(Boolean),
  });

const createTempFile = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "document-leakage-"));
  const filePath = path.join(dir, "safe.pdf");
  await fs.writeFile(filePath, minimalPdfContent);

  return {
    dir,
    filePath,
  };
};

const uploadDocument = async (user) => {
  const { dir, filePath } = await createTempFile();

  const res = await api()
    .post("/api/documents")
    .set("Authorization", authHeader(user))
    .field({
      module: "SYSTEM",
      entityType: "OTHER",
      entityId: `document-leakage-${Date.now()}-${Math.random()}`,
      documentType: "OTHER",
      title: "Document Metadata Leakage Test",
    })
    .attach("file", filePath, {
      filename: "safe.pdf",
      contentType: "application/pdf",
    });

  await fs.rm(dir, {
    recursive: true,
    force: true,
  });

  return res;
};

const expectNoStorageInternals = (value) => {
  const body = JSON.stringify(value);

  expect(body).not.toContain("filePath");
  expect(body).not.toContain("storageProvider");
  expect(body).not.toContain("uploads/storage");
  expect(body).not.toContain("uploads/temp");
  expect(body).not.toContain("disk:/");
};

describe("document metadata leakage security", () => {
  it("upload response does not expose storage internals", async () => {
    const user = await createDocumentUser();

    const res = await uploadDocument(user);

    expect(res.status).toBe(201);
    expectNoStorageInternals(res.body);
  });

  it("list response does not expose storage internals", async () => {
    const user = await createDocumentUser();

    await uploadDocument(user);

    const res = await api().get("/api/documents").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expectNoStorageInternals(res.body);
  });

  it("detail response does not expose storage internals", async () => {
    const user = await createDocumentUser();

    const uploadRes = await uploadDocument(user);
    const documentId = uploadRes.body.data.id;

    const res = await api().get(`/api/documents/${documentId}`).set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expectNoStorageInternals(res.body);
  });

  it("download url response does not expose provider internals", async () => {
    const user = await createDocumentUser();

    const uploadRes = await uploadDocument(user);
    const documentId = uploadRes.body.data.id;

    const res = await api().get(`/api/documents/${documentId}/download-url`).set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(res.body.data.url).toBeTruthy();
    expectNoStorageInternals(res.body);

    expect(res.body.data).not.toHaveProperty("filePath");
    expect(res.body.data).not.toHaveProperty("storageProvider");
  });
});
