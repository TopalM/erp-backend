import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { prisma } from "../../src/database/prisma.client.js";

const fixtureDir = path.join(process.cwd(), "tests", "fixtures-path-traversal");
const safePath = path.join(fixtureDir, "safe.pdf");

describe("upload path traversal security", () => {
  beforeEach(() => {
    fs.mkdirSync(fixtureDir, { recursive: true });
    fs.writeFileSync(safePath, "fake pdf");
  });

  afterEach(() => {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  const createUploader = () =>
    createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE, PERMISSIONS.SYSTEM_LOG_READ],
    });

  it("sanitizes dangerous original filename", async () => {
    const user = await createUploader();

    const res = await api()
      .post("/api/documents")
      .set("Authorization", authHeader(user))
      .field("module", "SYSTEM")
      .field("entityType", "OTHER")
      .field("entityId", `path-traversal-${Date.now()}`)
      .field("documentType", "OTHER")
      .attach("file", safePath, "../../evil.pdf");

    expect(res.status).toBe(201);
    expect(res.body.data.originalFileName).not.toContain("../");
    expect(res.body.data.storedFileName).not.toContain("../");
    expect(res.body.data.filePath).not.toContain("..");
  });

  it("does not create file outside upload/storage path", async () => {
    const user = await createUploader();

    const evilRootPath = path.join(process.cwd(), "evil.pdf");

    if (fs.existsSync(evilRootPath)) {
      fs.unlinkSync(evilRootPath);
    }

    const res = await api()
      .post("/api/documents")
      .set("Authorization", authHeader(user))
      .field("module", "SYSTEM")
      .field("entityType", "OTHER")
      .field("entityId", `path-traversal-root-${Date.now()}`)
      .field("documentType", "OTHER")
      .attach("file", safePath, "../../evil.pdf");

    expect(res.status).toBe(201);
    expect(fs.existsSync(evilRootPath)).toBe(false);
  });

  it("stores uploaded document with normalized storage path", async () => {
    const user = await createUploader();

    const res = await api()
      .post("/api/documents")
      .set("Authorization", authHeader(user))
      .field("module", "SYSTEM")
      .field("entityType", "OTHER")
      .field("entityId", `Path Traversal Entity ${Date.now()}`)
      .field("documentType", "OTHER")
      .attach("file", safePath, "safe.pdf");

    expect(res.status).toBe(201);

    const document = await prisma.document.findUnique({
      where: {
        id: res.body.data.id,
      },
    });

    expect(document.filePath).toBeTruthy();
    expect(document.filePath).not.toContain(" ");
    expect(document.filePath).not.toContain("..");
  });
});
