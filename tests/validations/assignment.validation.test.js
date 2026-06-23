import { describe, it, expect } from "vitest";

import { createAssignmentSchema, updateAssignmentSchema } from "../../src/modules/platform/assignment/assignment.validation.js";

describe("assignment validation schemas", () => {
  it("accepts valid create assignment payload", () => {
    const result = createAssignmentSchema.safeParse({
      module: "SYSTEM",
      entityType: "OTHER",
      entityId: "test-assignment",
      userId: "user-id",
      role: "RESPONSIBLE",
      note: "note",
    });

    expect(result.success).toBe(true);
  });

  it("defaults role to RESPONSIBLE", () => {
    const result = createAssignmentSchema.safeParse({
      module: "SYSTEM",
      entityType: "OTHER",
      entityId: "test-assignment",
      userId: "user-id",
    });

    expect(result.success).toBe(true);
    expect(result.data.role).toBe("RESPONSIBLE");
  });

  it("rejects empty create assignment fields", () => {
    const result = createAssignmentSchema.safeParse({
      module: "",
      entityType: "",
      entityId: "",
      userId: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts update assignment payload", () => {
    const result = updateAssignmentSchema.safeParse({
      role: "VIEWER",
      note: null,
    });

    expect(result.success).toBe(true);
  });
});
