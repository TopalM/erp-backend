import { describe, it, expect } from "vitest";

import * as approvalService from "../../src/modules/platform/approval/approval.service.js";
import { createTestUser } from "../setup/factories.js";

describe("approval.service", () => {
  it("submits approval", async () => {
    const user = await createTestUser();

    const approval = await approvalService.submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-approval-service-${Date.now()}`,
        decisionNote: "test",
      },
      user.id,
    );

    expect(approval.status).toBe("PENDING");
    expect(approval.requestedById).toBe(user.id);
  });

  it("approves approval", async () => {
    const user = await createTestUser();

    const approval = await approvalService.submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-approval-approve-${Date.now()}`,
      },
      user.id,
    );

    const approved = await approvalService.approveApprovalService(
      approval.id,
      {
        decisionNote: "approved",
      },
      user.id,
    );

    expect(approved.status).toBe("APPROVED");
    expect(approved.decidedAt).toBeTruthy();
  });

  it("rejects approval", async () => {
    const user = await createTestUser();

    const approval = await approvalService.submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-approval-reject-${Date.now()}`,
      },
      user.id,
    );

    const rejected = await approvalService.rejectApprovalService(
      approval.id,
      {
        rejectReason: "missing data",
      },
      user.id,
    );

    expect(rejected.status).toBe("REJECTED");
    expect(rejected.rejectReason).toBe("missing data");
  });

  it("cancels approval", async () => {
    const user = await createTestUser();

    const approval = await approvalService.submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-approval-cancel-${Date.now()}`,
      },
      user.id,
    );

    const cancelled = await approvalService.cancelApprovalService(approval.id);

    expect(cancelled.status).toBe("CANCELLED");
  });
});
