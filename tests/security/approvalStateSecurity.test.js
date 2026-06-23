import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { prisma } from "../../src/database/prisma.client.js";

const submitApproval = async (user, entityId = `approval-state-${Date.now()}`) => {
  return api().post("/api/approvals/submit").set("Authorization", authHeader(user)).send({
    module: "SYSTEM",
    entityType: "OTHER",
    entityId,
  });
};

describe("approval state security", () => {
  it("rejects approve without APPROVAL_DECIDE", async () => {
    const creator = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const submitRes = await submitApproval(creator);
    expect(submitRes.status).toBe(201);

    const user = await createTestUser();

    const res = await api().patch(`/api/approvals/${submitRes.body.data.id}/approve`).set("Authorization", authHeader(user)).send({
      decisionNote: "approve",
    });

    expect(res.status).toBe(403);
  });

  it("allows approve with APPROVAL_DECIDE", async () => {
    const creator = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const submitRes = await submitApproval(creator);
    expect(submitRes.status).toBe(201);

    const approver = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const res = await api().patch(`/api/approvals/${submitRes.body.data.id}/approve`).set("Authorization", authHeader(approver)).send({
      decisionNote: "approve",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("APPROVED");
  });

  it("rejects cancel without APPROVAL_CANCEL", async () => {
    const creator = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const submitRes = await submitApproval(creator);
    expect(submitRes.status).toBe(201);

    const user = await createTestUser();

    const res = await api().patch(`/api/approvals/${submitRes.body.data.id}/cancel`).set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("keeps unique approval per module entityType entityId on resubmit", async () => {
    const creator = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const entityId = `approval-unique-${Date.now()}`;

    const first = await submitApproval(creator, entityId);
    const second = await submitApproval(creator, entityId);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.data.id).toBe(first.body.data.id);

    const count = await prisma.approval.count({
      where: {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId,
      },
    });

    expect(count).toBe(1);
  });
});
