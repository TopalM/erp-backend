import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const minimalPdfContent = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n");

const createUserWithPermissions = (permissions) =>
  createTestUser({
    permissions,
  });

const createTempFile = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "document-delete-security-"));
  const filePath = path.join(dir, "safe.pdf");
  await fs.writeFile(filePath, minimalPdfContent);

  return {
    dir,
    filePath,
  };
};

const uploadSystemDocument = async (user) => {
  const { dir, filePath } = await createTempFile();

  const res = await api()
    .post("/api/documents")
    .set("Authorization", authHeader(user))
    .field({
      module: "SYSTEM",
      entityType: "OTHER",
      entityId: `document-delete-security-${Date.now()}-${Math.random()}`,
      documentType: "OTHER",
      title: "Document Delete Permission Security Test",
    })
    .attach("file", filePath, {
      filename: "safe.pdf",
      contentType: "application/pdf",
    });

  await fs.rm(dir, {
    recursive: true,
    force: true,
  });

  expect(res.status).toBe(201);

  return res.body.data;
};

describe("document delete permission security", () => {
  it("does not allow read-only user to delete document", async () => {
    const creator = await createUserWithPermissions(
      [PERMISSIONS.DOCUMENT_CREATE, PERMISSIONS.DOCUMENT_READ, PERMISSIONS.SYSTEM_LOG_READ, PERMISSIONS.DOCUMENT_DOWNLOAD].filter(Boolean),
    );

    const document = await uploadSystemDocument(creator);

    const readOnlyUser = await createUserWithPermissions(
      [PERMISSIONS.DOCUMENT_READ, PERMISSIONS.SYSTEM_LOG_READ, PERMISSIONS.DOCUMENT_DOWNLOAD].filter(Boolean),
    );

    const res = await api().delete(`/api/documents/${document.id}`).set("Authorization", authHeader(readOnlyUser));

    expect(res.status).toBe(403);
  });

  it("allows user with delete permission to soft delete document", async () => {
    const user = await createUserWithPermissions(
      [
        PERMISSIONS.DOCUMENT_CREATE,
        PERMISSIONS.DOCUMENT_READ,
        PERMISSIONS.DOCUMENT_DELETE,
        PERMISSIONS.DOCUMENT_DOWNLOAD,
        PERMISSIONS.SYSTEM_LOG_READ,
        PERMISSIONS.SYSTEM_LOG_DELETE,
      ].filter(Boolean),
    );

    const document = await uploadSystemDocument(user);

    const deleteRes = await api().delete(`/api/documents/${document.id}`).set("Authorization", authHeader(user));

    expect(deleteRes.status).toBe(200);
    expect(JSON.stringify(deleteRes.body)).not.toContain("filePath");
    expect(JSON.stringify(deleteRes.body)).not.toContain("storageProvider");

    const detailRes = await api().get(`/api/documents/${document.id}`).set("Authorization", authHeader(user));

    expect(detailRes.status).toBe(404);

    const downloadRes = await api().get(`/api/documents/${document.id}/download-url`).set("Authorization", authHeader(user));

    expect(downloadRes.status).toBe(404);
  });
});
