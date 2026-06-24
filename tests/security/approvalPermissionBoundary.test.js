import { describe, it, expect } from "vitest";
import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { prisma } from "../../src/database/prisma.client.js";

describe("approval permission boundary security", () => {
  it("APPROVAL_READ cannot submit approval", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_READ],
    });

    const res = await api()
      .post("/api/approvals/submit")
      .set("Authorization", authHeader(user))
      .send({
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `approval-boundary-${Date.now()}`,
      });

    expect(res.status).toBe(403);
  });

  it("APPROVAL_CREATE cannot approve approval", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const approval = await prisma.approval.create({
      data: {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `approval-boundary-${Date.now()}`,
        status: "PENDING",
      },
    });

    const res = await api().patch(`/api/approvals/${approval.id}/approve`).set("Authorization", authHeader(user)).send({
      decisionNote: "approve attempt",
    });

    expect(res.status).toBe(403);
  });

  it("APPROVAL_DECIDE cannot cancel approval", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const approval = await prisma.approval.create({
      data: {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `approval-boundary-${Date.now()}`,
        status: "PENDING",
      },
    });

    const res = await api().patch(`/api/approvals/${approval.id}/cancel`).set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });
});
