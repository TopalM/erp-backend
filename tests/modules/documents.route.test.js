import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach } from "vitest";
import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const tempFilePath = path.join(process.cwd(), "tests", "temp-document.txt");

describe("Document routes", () => {
  beforeEach(() => {
    fs.writeFileSync(tempFilePath, "test document");
  });

  it("lists documents with DOCUMENT_READ permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_READ],
    });

    const res = await api().get("/api/documents").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
  });

  it("uploads document with DOCUMENT_CREATE permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE],
    });

    const res = await api()
      .post("/api/documents")
      .set("Authorization", authHeader(user))
      .field("module", "SYSTEM")
      .field("entityType", "OTHER")
      .field("entityId", `test-document-${Date.now()}`)
      .field("documentType", "OTHER")
      .attach("file", tempFilePath);

    expect(res.status).toBe(201);
    expect(res.body.data.originalFileName).toBe("temp-document.txt");
  });

  it("rejects upload without DOCUMENT_CREATE permission", async () => {
    const user = await createTestUser();

    const res = await api()
      .post("/api/documents")
      .set("Authorization", authHeader(user))
      .field("module", "SYSTEM")
      .field("entityType", "OTHER")
      .field("entityId", `test-document-${Date.now()}`)
      .field("documentType", "OTHER")
      .attach("file", tempFilePath);

    expect(res.status).toBe(403);
  });
});
