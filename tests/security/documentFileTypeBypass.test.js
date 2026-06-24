import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const tempDir = path.join(process.cwd(), "tests", "tmp-security");
const blockedFile = path.join(tempDir, "malicious.exe");

describe("document file type bypass security", () => {
  beforeEach(() => {
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(blockedFile, "fake executable");
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("rejects unsupported executable extension", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE],
    });

    const res = await api()
      .post("/api/documents")
      .set("Authorization", authHeader(user))
      .field("module", "SYSTEM")
      .field("entityType", "OTHER")
      .field("entityId", `file-type-${Date.now()}`)
      .field("documentType", "OTHER")
      .attach("file", blockedFile);

    expect([400, 415]).toContain(res.status);
  });
});
