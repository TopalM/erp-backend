import { describe, it, expect } from "vitest";

import { createDocumentSchema } from "../../src/modules/platform/document/document.validation.js";

describe("document validation schema", () => {
  it("accepts valid document payload", () => {
    const result = createDocumentSchema.safeParse({
      module: "SYSTEM",
      entityType: "OTHER",
      entityId: "test-entity",
      documentType: "OTHER",
      title: "Test Document",
      description: "Description",
    });

    expect(result.success).toBe(true);
  });

  it("defaults documentType to OTHER", () => {
    const result = createDocumentSchema.safeParse({
      module: "SYSTEM",
      entityType: "OTHER",
      entityId: "test-entity",
    });

    expect(result.success).toBe(true);
    expect(result.data.documentType).toBe("OTHER");
  });

  it("rejects invalid module", () => {
    const result = createDocumentSchema.safeParse({
      module: "INVALID",
      entityType: "OTHER",
      entityId: "test-entity",
    });

    expect(result.success).toBe(false);
  });

  it("rejects old PURCHASE_INVOICE entity type", () => {
    const result = createDocumentSchema.safeParse({
      module: "PURCHASING",
      entityType: "PURCHASE_INVOICE",
      entityId: "test-entity",
    });

    expect(result.success).toBe(false);
  });

  it("accepts VENDOR_INVOICE entity type", () => {
    const result = createDocumentSchema.safeParse({
      module: "PURCHASING",
      entityType: "VENDOR_INVOICE",
      entityId: "test-entity",
    });

    expect(result.success).toBe(true);
  });
});
