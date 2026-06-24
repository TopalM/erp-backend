import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach } from "vitest";

import * as documentService from "../../src/modules/platform/document/document.service.js";
import { createTestUser } from "../setup/factories.js";

const fixturePath = path.join(process.cwd(), "tests", "service-document.pdf");

const createFile = () => {
  fs.writeFileSync(fixturePath, "service document");
};

const createAdminServiceUser = async () => {
  const dbUser = await createTestUser();

  return {
    ...dbUser,
    role: {
      name: "ADMIN",
    },
    userPermissions: [],
  };
};

describe("document.service", () => {
  beforeEach(() => {
    createFile();
  });

  it("uploads document", async () => {
    const user = await createAdminServiceUser();

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
      user,
    });

    expect(document.originalFileName).toBe("service-document.pdf");
    expect(document.uploadedById).toBe(user.id);
  });

  it("lists active documents", async () => {
    const user = await createAdminServiceUser();

    const documents = await documentService.listDocumentsService(
      {
        module: "SYSTEM",
      },
      user,
    );

    expect(Array.isArray(documents)).toBe(true);
  });

  it("throws when document not found", async () => {
    const user = await createAdminServiceUser();

    await expect(documentService.getDocumentByIdService("missing-id", user)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("deactivates document", async () => {
    createFile();

    const user = await createAdminServiceUser();

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
      user,
    });

    const deleted = await documentService.deactivateDocumentService(document.id, user);

    expect(deleted.isActive).toBe(false);
  });
});
