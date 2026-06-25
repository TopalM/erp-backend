import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const unique = () => `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

const createApproval = async ({ requestedById = null, approverId = null, status = "PENDING" } = {}) => {
  const id = unique();

  return prisma.approval.create({
    data: {
      module: "PURCHASING",
      entityType: "PURCHASE_REQUEST",
      entityId: `approval-${id}`,
      status,
      requestedById,
      approverId,
      decisionNote: null,
      rejectReason: null,
    },
  });
};

describe("approval security", () => {
  it("rejects plain user from listing approvals", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/approvals").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("allows user with APPROVAL_READ to list approvals", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_READ],
    });

    const res = await api().get("/api/approvals").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("rejects plain user from submitting approval", async () => {
    const user = await createTestUser();

    const res = await api()
      .post("/api/approvals/submit")
      .set("Authorization", authHeader(user))
      .send({
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `approval-submit-${unique()}`,
      });

    expect(res.status).toBe(403);
  });

  it("allows user with APPROVAL_CREATE to submit approval", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const res = await api()
      .post("/api/approvals/submit")
      .set("Authorization", authHeader(user))
      .send({
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `approval-submit-${unique()}`,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("PENDING");
  });

  it("rejects decide when approval is assigned to another approver", async () => {
    const requester = await createTestUser();
    const approver = await createTestUser();
    const otherDecider = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const approval = await createApproval({
      requestedById: requester.id,
      approverId: approver.id,
    });

    const res = await api().patch(`/api/approvals/${approval.id}/approve`).set("Authorization", authHeader(otherDecider)).send({
      decisionNote: "Should not pass",
    });

    expect(res.status).toBe(403);
  });

  it("rejects requester from deciding own approval", async () => {
    const requester = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const approval = await createApproval({
      requestedById: requester.id,
      approverId: requester.id,
    });

    const res = await api().patch(`/api/approvals/${approval.id}/approve`).set("Authorization", authHeader(requester)).send({
      decisionNote: "Self approve",
    });

    expect(res.status).toBe(403);
  });

  it("allows assigned approver with APPROVAL_DECIDE to approve", async () => {
    const requester = await createTestUser();
    const approver = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const approval = await createApproval({
      requestedById: requester.id,
      approverId: approver.id,
    });

    const res = await api().patch(`/api/approvals/${approval.id}/approve`).set("Authorization", authHeader(approver)).send({
      decisionNote: "Approved",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("APPROVED");
  });

  it("rejects non-requester from cancelling approval", async () => {
    const requester = await createTestUser();
    const otherUser = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CANCEL],
    });

    const approval = await createApproval({
      requestedById: requester.id,
    });

    const res = await api().patch(`/api/approvals/${approval.id}/cancel`).set("Authorization", authHeader(otherUser));

    expect(res.status).toBe(403);
  });

  it("allows requester with APPROVAL_CANCEL to cancel own approval", async () => {
    const requester = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CANCEL],
    });

    const approval = await createApproval({
      requestedById: requester.id,
    });

    const res = await api().patch(`/api/approvals/${approval.id}/cancel`).set("Authorization", authHeader(requester));

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CANCELLED");
  });
});
