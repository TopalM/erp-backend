import { describe, it, expect } from "vitest";

import { listDocumentsService, deactivateDocumentService } from "../../src/modules/platform/document/document.service.js";

describe("document.service edge coverage", () => {
  it("returns no access scope when user has no document permissions", async () => {
    const user = {
      id: "user-no-doc-permissions",
      role: { name: "VIEWER" },
      userPermissions: [],
    };

    const result = await listDocumentsService({}, user);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("rejects deactivate when document does not exist", async () => {
    const user = {
      id: "admin-user",
      role: { name: "ADMIN" },
      userPermissions: [],
    };

    await expect(deactivateDocumentService("not-existing-document-id", user)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
