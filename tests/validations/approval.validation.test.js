import { describe, it, expect } from "vitest";

import { submitApprovalSchema, decideApprovalSchema } from "../../src/modules/platform/approval/approval.validation.js";

describe("approval validation schemas", () => {
  it("accepts valid submit approval payload", () => {
    const result = submitApprovalSchema.safeParse({
      module: "SYSTEM",
      entityType: "OTHER",
      entityId: "test-approval",
      approverId: null,
      decisionNote: "Please approve",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty submit approval fields", () => {
    const result = submitApprovalSchema.safeParse({
      module: "",
      entityType: "",
      entityId: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts empty decision payload", () => {
    const result = decideApprovalSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("accepts reject reason and decision note", () => {
    const result = decideApprovalSchema.safeParse({
      decisionNote: "Checked",
      rejectReason: "Missing data",
    });

    expect(result.success).toBe(true);
  });
});
