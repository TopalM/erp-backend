import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const createPendingApproval = async ({ requesterId, approverId = null } = {}) => {
  return prisma.approval.create({
    data: {
      module: "PURCHASING",
      entityType: "PURCHASE_REQUEST",
      entityId: `approval-idor-${Date.now()}-${Math.random()}`,
      status: "PENDING",
      requestedById: requesterId,
      approverId,
    },
  });
};

describe("approval IDOR security", () => {
  it("does not allow user with APPROVAL_DECIDE to approve approval assigned to someone else", async () => {
    const requester = await createTestUser();
    const realApprover = await createTestUser();
    const attacker = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const approval = await createPendingApproval({
      requesterId: requester.id,
      approverId: realApprover.id,
    });

    const res = await api().patch(`/api/approvals/${approval.id}/approve`).set("Authorization", authHeader(attacker)).send({
      decisionNote: "IDOR approve attempt",
    });

    expect(res.status).toBe(403);
  });

  it("does not allow user with APPROVAL_DECIDE to reject approval assigned to someone else", async () => {
    const requester = await createTestUser();
    const realApprover = await createTestUser();
    const attacker = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const approval = await createPendingApproval({
      requesterId: requester.id,
      approverId: realApprover.id,
    });

    const res = await api().patch(`/api/approvals/${approval.id}/reject`).set("Authorization", authHeader(attacker)).send({
      rejectReason: "IDOR reject attempt",
    });

    expect(res.status).toBe(403);
  });

  it("does not allow user with APPROVAL_CANCEL to cancel another requester's approval", async () => {
    const requester = await createTestUser();
    const attacker = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CANCEL],
    });

    const approval = await createPendingApproval({
      requesterId: requester.id,
    });

    const res = await api().patch(`/api/approvals/${approval.id}/cancel`).set("Authorization", authHeader(attacker)).send({
      decisionNote: "IDOR cancel attempt",
    });

    expect(res.status).toBe(403);
  });

  it("allows assigned approver with APPROVAL_DECIDE to approve approval", async () => {
    const requester = await createTestUser();
    const approver = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const approval = await createPendingApproval({
      requesterId: requester.id,
      approverId: approver.id,
    });

    const res = await api().patch(`/api/approvals/${approval.id}/approve`).set("Authorization", authHeader(approver)).send({
      decisionNote: "approved by assigned approver",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("APPROVED");
  });

  it("allows requester with APPROVAL_CANCEL to cancel own approval", async () => {
    const requester = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CANCEL],
    });

    const approval = await createPendingApproval({
      requesterId: requester.id,
    });

    const res = await api().patch(`/api/approvals/${approval.id}/cancel`).set("Authorization", authHeader(requester)).send({
      decisionNote: "cancelled by requester",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CANCELLED");
  });
});
