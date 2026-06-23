import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const fixtureDir = path.join(process.cwd(), "tests", "fixtures-document-acl");
const pdfPath = path.join(fixtureDir, "document-acl.pdf");

const uploadDocument = async (user, entityId = `doc-acl-${Date.now()}`) => {
  return api()
    .post("/api/documents")
    .set("Authorization", authHeader(user))
    .field("module", "SYSTEM")
    .field("entityType", "OTHER")
    .field("entityId", entityId)
    .field("documentType", "OTHER")
    .attach("file", pdfPath);
};

describe("document access control security", () => {
  beforeEach(() => {
    fs.mkdirSync(fixtureDir, { recursive: true });
    fs.writeFileSync(pdfPath, "fake pdf");
  });

  afterEach(() => {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it("rejects document list without DOCUMENT_READ", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/documents").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("allows document list with DOCUMENT_READ", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_READ],
    });

    const res = await api().get("/api/documents").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
  });

  it("rejects document detail without DOCUMENT_READ", async () => {
    const uploader = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE],
    });

    const uploadRes = await uploadDocument(uploader);
    expect(uploadRes.status).toBe(201);

    const user = await createTestUser();

    const res = await api().get(`/api/documents/${uploadRes.body.data.id}`).set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("allows document detail with DOCUMENT_READ", async () => {
    const uploader = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE],
    });

    const uploadRes = await uploadDocument(uploader);
    expect(uploadRes.status).toBe(201);

    const reader = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_READ],
    });

    const res = await api().get(`/api/documents/${uploadRes.body.data.id}`).set("Authorization", authHeader(reader));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(uploadRes.body.data.id);
  });

  it("rejects document delete without DOCUMENT_DELETE", async () => {
    const uploader = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE],
    });

    const uploadRes = await uploadDocument(uploader);
    expect(uploadRes.status).toBe(201);

    const user = await createTestUser();

    const res = await api().delete(`/api/documents/${uploadRes.body.data.id}`).set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });
});
