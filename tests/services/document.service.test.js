import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach } from "vitest";

import * as documentService from "../../src/modules/platform/document/document.service.js";
import { createTestUser } from "../setup/factories.js";

const fixturePath = path.join(process.cwd(), "tests", "service-document.pdf");

const createFile = () => {
  fs.writeFileSync(fixturePath, "service document");
};

describe("document.service", () => {
  beforeEach(() => {
    createFile();
  });

  it("uploads document", async () => {
    const user = await createTestUser();

    const document = await documentService.uploadDocumentService({
      payload: {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-document-service-${Date.now()}`,
        documentType: "OTHER",
        title: "Service Document",
      },
      file: {
        path: fixturePath,
        originalname: "service-document.pdf",
        mimetype: "application/pdf",
        size: fs.statSync(fixturePath).size,
      },
      userId: user.id,
    });

    expect(document.originalFileName).toBe("service-document.pdf");
    expect(document.uploadedById).toBe(user.id);
  });

  it("lists active documents", async () => {
    const documents = await documentService.listDocumentsService({
      module: "SYSTEM",
    });

    expect(Array.isArray(documents)).toBe(true);
  });

  it("throws when document not found", async () => {
    await expect(documentService.getDocumentByIdService("missing-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("deactivates document", async () => {
    createFile();

    const user = await createTestUser();

    const document = await documentService.uploadDocumentService({
      payload: {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-document-delete-${Date.now()}`,
        documentType: "OTHER",
      },
      file: {
        path: fixturePath,
        originalname: "service-document.pdf",
        mimetype: "application/pdf",
        size: fs.statSync(fixturePath).size,
      },
      userId: user.id,
    });

    const deleted = await documentService.deactivateDocumentService(document.id);

    expect(deleted.isActive).toBe(false);
  });
});
