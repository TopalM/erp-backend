import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { minimalPdfContent } from "../setup/fileFixtures.js";

const fixtureDir = path.join(process.cwd(), "tests", "fixtures-document-idor");
const pdfPath = path.join(fixtureDir, "safe-file.pdf");

const createPdfFixture = () => {
  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.writeFileSync(pdfPath, minimalPdfContent);
};

const cleanupFixture = () => {
  fs.rmSync(fixtureDir, { recursive: true, force: true });
};

const uploadDocument = async (user, module = "SYSTEM") => {
  createPdfFixture();

  return api()
    .post("/api/documents")
    .set("Authorization", authHeader(user))
    .field("module", module)
    .field("entityType", "OTHER")
    .field("entityId", `idor-doc-${Date.now()}-${Math.random()}`)
    .field("documentType", "OTHER")
    .field("title", "IDOR Test Document")
    .attach("file", pdfPath, {
      filename: "safe-file.pdf",
      contentType: "application/pdf",
    });
};

describe("document IDOR security", () => {
  afterEach(() => {
    cleanupFixture();
  });

  it("does not allow user without module read permission to access another document detail", async () => {
    const uploader = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE, PERMISSIONS.SYSTEM_LOG_READ],
    });

    const uploadRes = await uploadDocument(uploader, "SYSTEM");

    expect(uploadRes.status).toBe(201);

    const attacker = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_READ],
    });

    const res = await api().get(`/api/documents/${uploadRes.body.data.id}`).set("Authorization", authHeader(attacker));

    expect(res.status).toBe(403);
  });

  it("allows user with DOCUMENT_READ and module read permission to access document detail", async () => {
    const uploader = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE, PERMISSIONS.SYSTEM_LOG_READ],
    });

    const uploadRes = await uploadDocument(uploader, "SYSTEM");

    expect(uploadRes.status).toBe(201);

    const reader = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_READ, PERMISSIONS.SYSTEM_LOG_READ],
    });

    const res = await api().get(`/api/documents/${uploadRes.body.data.id}`).set("Authorization", authHeader(reader));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(uploadRes.body.data.id);
  });

  it("does not expose download url to user without module read permission", async () => {
    const uploader = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE, PERMISSIONS.SYSTEM_LOG_READ],
    });

    const uploadRes = await uploadDocument(uploader, "SYSTEM");

    expect(uploadRes.status).toBe(201);

    const attacker = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_DOWNLOAD],
    });

    const res = await api().get(`/api/documents/${uploadRes.body.data.id}/download-url`).set("Authorization", authHeader(attacker));

    expect(res.status).toBe(403);
  });

  it("does not allow user without module read permission to delete another document", async () => {
    const uploader = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE, PERMISSIONS.SYSTEM_LOG_READ],
    });

    const uploadRes = await uploadDocument(uploader, "SYSTEM");

    expect(uploadRes.status).toBe(201);

    const attacker = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_DELETE],
    });

    const res = await api().delete(`/api/documents/${uploadRes.body.data.id}`).set("Authorization", authHeader(attacker));

    expect(res.status).toBe(403);
  });
});
