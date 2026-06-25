import { describe, it, expect } from "vitest";

import { createTestUser } from "../setup/factories.js";
import { authRequest } from "../setup/auth.js";
import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const createDownloadUser = () =>
  createTestUser({
    permissions: [PERMISSIONS.DOCUMENT_DOWNLOAD, PERMISSIONS.SYSTEM_LOG_READ],
  });

const createReadableUser = () =>
  createTestUser({
    permissions: [PERMISSIONS.DOCUMENT_DOWNLOAD, PERMISSIONS.SYSTEM_LOG_READ],
  });

const createDocument = async ({ isActive = true, uploadedById = null } = {}) => {
  return prisma.document.create({
    data: {
      module: "SYSTEM",
      entityType: "OTHER",
      entityId: `storage-download-${Date.now()}-${Math.random()}`,
      documentType: "OTHER",
      title: "Storage Security",
      description: "Storage download security test",
      originalFileName: "storage-security.pdf",
      storedFileName: `${Date.now()}-${Math.round(Math.random() * 1e9)}-storage-security.pdf`,
      filePath: "system/other/storage-security.pdf",
      mimeType: "application/pdf",
      fileExtension: ".pdf",
      sizeBytes: 128,
      storageProvider: "LOCAL",
      uploadedById,
      isActive,
    },
  });
};

describe("storage download security", () => {
  it("cannot access non existing document download", async () => {
    const user = await createDownloadUser();

    const res = await authRequest(user).get("/api/documents/fake-id/download-url");

    expect(res.status).toBe(404);
  });

  it("cannot get download url without DOCUMENT_DOWNLOAD permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_LOG_READ],
    });

    const document = await createDocument({
      uploadedById: user.id,
    });

    const res = await authRequest(user).get(`/api/documents/${document.id}/download-url`);

    expect(res.status).toBe(403);
  });

  it("cannot get download url without module read permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_DOWNLOAD],
    });

    const document = await createDocument({
      uploadedById: user.id,
    });

    const res = await authRequest(user).get(`/api/documents/${document.id}/download-url`);

    expect(res.status).toBe(403);
  });

  it("can get download url with document download and module read permission", async () => {
    const user = await createDownloadUser();

    const document = await createDocument({
      uploadedById: user.id,
    });

    const res = await authRequest(user).get(`/api/documents/${document.id}/download-url`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(document.id);
    expect(res.body.data.fileName).toBe("storage-security.pdf");
    expect(res.body.data.mimeType).toBe("application/pdf");
    expect(res.body.data.url).toBeTruthy();
  });

  it("cannot get download url for inactive document", async () => {
    const user = await createDownloadUser();

    const document = await createDocument({
      uploadedById: user.id,
      isActive: false,
    });

    const res = await authRequest(user).get(`/api/documents/${document.id}/download-url`);

    expect(res.status).toBe(404);
  });

  it("download response does not expose storage filePath or provider internals", async () => {
    const user = await createReadableUser();

    const document = await createDocument({
      uploadedById: user.id,
    });

    const res = await authRequest(user).get(`/api/documents/${document.id}/download-url`);

    expect(res.status).toBe(200);
    expect(res.body.data.url).toBeTruthy();

    expect(res.body.data.filePath).toBeUndefined();
    expect(res.body.data.storageProvider).toBeUndefined();
    expect(res.body.data.storedFileName).toBeUndefined();

    expect(JSON.stringify(res.body)).not.toContain("system/other/storage-security.pdf");
    expect(JSON.stringify(res.body)).not.toContain("LOCAL");
  });
});
