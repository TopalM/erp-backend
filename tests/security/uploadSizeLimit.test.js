import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const tempDir = path.join(process.cwd(), "tests", "tmp-security");
const largeFile = path.join(tempDir, "large-file.pdf");

describe("upload size limit security", () => {
  beforeEach(() => {
    fs.mkdirSync(tempDir, { recursive: true });

    // multer limit 10MB ise bunu aşar.
    fs.writeFileSync(largeFile, Buffer.alloc(11 * 1024 * 1024, "a"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("rejects file larger than upload limit", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE],
    });

    const res = await api()
      .post("/api/documents")
      .set("Authorization", authHeader(user))
      .field("module", "SYSTEM")
      .field("entityType", "OTHER")
      .field("entityId", `large-file-${Date.now()}`)
      .field("documentType", "OTHER")
      .attach("file", largeFile);

    expect([400, 413, 500]).toContain(res.status);
  });
});
