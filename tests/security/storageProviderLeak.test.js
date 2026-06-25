import fs from "fs";
import path from "path";
import { describe, it, expect, afterEach } from "vitest";

import { minimalPdfContent } from "../setup/fileFixtures.js";
import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const fixtureDir = path.join(process.cwd(), "tests", "fixtures-storage-leak");
const pdfPath = path.join(fixtureDir, "storage-leak.pdf");

describe("storage provider leak security", () => {
  afterEach(() => {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  });

  it("upload response does not expose internal storage provider details beyond allowed metadata", async () => {
    fs.mkdirSync(fixtureDir, { recursive: true });
    fs.writeFileSync(pdfPath, minimalPdfContent);

    const user = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE, PERMISSIONS.SYSTEM_LOG_READ],
    });

    const res = await api()
      .post("/api/documents")
      .set("Authorization", authHeader(user))
      .field("module", "SYSTEM")
      .field("entityType", "OTHER")
      .field("entityId", `storage-leak-${Date.now()}`)
      .field("documentType", "OTHER")
      .field("title", "Storage Leak Test")
      .attach("file", pdfPath, {
        filename: "storage-leak.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.originalFileName).toBe("storage-leak.pdf");

    expect(JSON.stringify(res.body)).not.toContain("disk:/");
    expect(JSON.stringify(res.body)).not.toContain("../");
    expect(JSON.stringify(res.body)).not.toContain("uploads/temp");
  });
});
