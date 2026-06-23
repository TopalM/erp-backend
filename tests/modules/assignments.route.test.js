import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("Assignment routes", () => {
  it("lists assignments with ASSIGNMENT_READ permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_READ],
    });

    const res = await authRequest(user).get("/api/assignments");

    expect(res.status).toBe(200);
  });

  it("creates assignment with ASSIGNMENT_CREATE permission", async () => {
    const assignee = await createTestUser();
    const user = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });

    const res = await authRequest(user)
      .post("/api/assignments")
      .send({
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-assignment-${Date.now()}`,
        userId: assignee.id,
        role: "RESPONSIBLE",
        note: "test",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe(assignee.id);
  });

  it("rejects create without ASSIGNMENT_CREATE permission", async () => {
    const assignee = await createTestUser();
    const user = await createTestUser();

    const res = await authRequest(user)
      .post("/api/assignments")
      .send({
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-assignment-${Date.now()}`,
        userId: assignee.id,
        role: "RESPONSIBLE",
      });

    expect(res.status).toBe(403);
  });
});
