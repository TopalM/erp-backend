import { describe, it, expect } from "vitest";

import { createTestUser } from "../setup/factories.js";

import {
  submitApprovalService,
  approveApprovalService,
  rejectApprovalService,
  cancelApprovalService,
} from "../../src/modules/platform/approval/approval.service.js";

const payload = (approverId) => ({
  module: "SYSTEM",
  entityType: "OTHER",
  entityId: `approval-security-${Date.now()}-${Math.random()}`,
  approverId,
});

describe("approval decision security", () => {
  it("does not allow requester to approve own approval", async () => {
    const requester = await createTestUser();
    const approver = await createTestUser();

    const approval = await submitApprovalService(payload(approver.id), requester.id);

    await expect(approveApprovalService(approval.id, {}, requester)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("does not allow unrelated user to approve assigned approval", async () => {
    const requester = await createTestUser();
    const approver = await createTestUser();
    const stranger = await createTestUser();

    const approval = await submitApprovalService(payload(approver.id), requester.id);

    await expect(approveApprovalService(approval.id, {}, stranger)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("allows assigned approver to approve", async () => {
    const requester = await createTestUser();
    const approver = await createTestUser();

    const approval = await submitApprovalService(payload(approver.id), requester.id);

    const result = await approveApprovalService(approval.id, { decisionNote: "ok" }, approver);

    expect(result.status).toBe("APPROVED");
    expect(result.approverId).toBe(approver.id);
  });

  it("does not allow non-requester to cancel approval", async () => {
    const requester = await createTestUser();
    const approver = await createTestUser();
    const stranger = await createTestUser();

    const approval = await submitApprovalService(payload(approver.id), requester.id);

    await expect(cancelApprovalService(approval.id, stranger)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("allows requester to cancel own approval", async () => {
    const requester = await createTestUser();
    const approver = await createTestUser();

    const approval = await submitApprovalService(payload(approver.id), requester.id);

    const result = await cancelApprovalService(approval.id, requester);

    expect(result.status).toBe("CANCELLED");
  });

  it("allows admin to reject regardless of approver assignment", async () => {
    const requester = await createTestUser();
    const approver = await createTestUser();
    const admin = await createTestUser({
      roleName: "ADMIN",
    });

    const approval = await submitApprovalService(payload(approver.id), requester.id);

    const result = await rejectApprovalService(approval.id, { rejectReason: "admin reject" }, admin);

    expect(result.status).toBe("REJECTED");
  });
});
