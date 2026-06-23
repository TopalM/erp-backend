import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const fixtureDir = path.join(process.cwd(), "tests", "fixtures-security");
const pdfPath = path.join(fixtureDir, "safe-file.pdf");
const exePath = path.join(fixtureDir, "malware.exe");
const jsPath = path.join(fixtureDir, "script.js");

describe("file upload security", () => {
  beforeEach(() => {
    fs.mkdirSync(fixtureDir, { recursive: true });
    fs.writeFileSync(pdfPath, "fake pdf");
    fs.writeFileSync(exePath, "fake exe");
    fs.writeFileSync(jsPath, "console.log('bad')");
  });

  afterEach(() => {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  const upload = (user, filePath) =>
    api()
      .post("/api/documents")
      .set("Authorization", authHeader(user))
      .field("module", "SYSTEM")
      .field("entityType", "OTHER")
      .field("entityId", `security-upload-${Date.now()}`)
      .field("documentType", "OTHER")
      .attach("file", filePath);

  it("allows approved file extension with permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE],
    });

    const res = await upload(user, pdfPath);

    expect(res.status).toBe(201);
  });

  it("rejects executable file upload", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE],
    });

    const res = await upload(user, exePath);

    expect(res.status).toBe(400);
  });

  it("rejects javascript file upload", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE],
    });

    const res = await upload(user, jsPath);

    expect(res.status).toBe(400);
  });

  it("rejects upload without DOCUMENT_CREATE permission", async () => {
    const user = await createTestUser();

    const res = await upload(user, pdfPath);

    expect(res.status).toBe(403);
  });
});
