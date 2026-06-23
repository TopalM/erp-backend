import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("Approval routes", () => {
  it("lists approvals with APPROVAL_READ permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_READ],
    });

    const res = await authRequest(user).get("/api/approvals");

    expect(res.status).toBe(200);
  });

  it("submits approval with APPROVAL_CREATE permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const res = await authRequest(user)
      .post("/api/approvals/submit")
      .send({
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-approval-${Date.now()}`,
        decisionNote: "test",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("PENDING");
  });

  it("rejects submit without APPROVAL_CREATE permission", async () => {
    const user = await createTestUser();

    const res = await authRequest(user)
      .post("/api/approvals/submit")
      .send({
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-approval-${Date.now()}`,
      });

    expect(res.status).toBe(403);
  });
});
