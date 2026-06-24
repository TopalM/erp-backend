import { describe, it, expect } from "vitest";

import * as approvalService from "../../src/modules/platform/approval/approval.service.js";
import { createTestUser } from "../setup/factories.js";

const asAdminUser = (user) => ({
  ...user,
  role: {
    name: "ADMIN",
  },
});

const uniqueEntityId = (prefix = "test-approval") => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

describe("approval.service", () => {
  it("lists approvals with filters", async () => {
    const user = await createTestUser();
    const entityId = uniqueEntityId("test-approval-list");

    const approval = await approvalService.submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId,
        decisionNote: "list test",
      },
      user.id,
    );

    const result = await approvalService.listApprovalsService({
      module: "SYSTEM",
      entityType: "OTHER",
      entityId,
      status: "PENDING",
      requestedById: user.id,
    });

    expect(result.some((item) => item.id === approval.id)).toBe(true);
  });

  it("submits approval", async () => {
    const user = await createTestUser();

    const approval = await approvalService.submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: uniqueEntityId("test-approval-service"),
        decisionNote: "test",
      },
      user.id,
    );

    expect(approval.status).toBe("PENDING");
    expect(approval.requestedById).toBe(user.id);
  });

  it("updates existing approval on resubmit", async () => {
    const user = await createTestUser();
    const entityId = uniqueEntityId("test-approval-resubmit");

    const first = await approvalService.submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId,
        decisionNote: "first",
      },
      user.id,
    );

    const second = await approvalService.submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId,
      },
      null,
    );

    expect(second.id).toBe(first.id);
    expect(second.status).toBe("PENDING");
    expect(second.requestedById).toBeNull();
    expect(second.decisionNote).toBeNull();
    expect(second.rejectReason).toBeNull();
    expect(second.decidedAt).toBeNull();
  });

  it("approves approval", async () => {
    const requester = await createTestUser();
    const approver = asAdminUser(await createTestUser());

    const approval = await approvalService.submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: uniqueEntityId("test-approval-approve"),
      },
      requester.id,
    );

    const approved = await approvalService.approveApprovalService(
      approval.id,
      {
        decisionNote: "approved",
      },
      approver,
    );

    expect(approved.status).toBe("APPROVED");
    expect(approved.decisionNote).toBe("approved");
    expect(approved.rejectReason).toBeNull();
    expect(approved.decidedAt).toBeTruthy();
  });

  it("rejects approval", async () => {
    const requester = await createTestUser();
    const approver = asAdminUser(await createTestUser());

    const approval = await approvalService.submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: uniqueEntityId("test-approval-reject"),
      },
      requester.id,
    );

    const rejected = await approvalService.rejectApprovalService(
      approval.id,
      {
        rejectReason: "missing data",
      },
      approver,
    );

    expect(rejected.status).toBe("REJECTED");
    expect(rejected.rejectReason).toBe("missing data");
    expect(rejected.decidedAt).toBeTruthy();
  });

  it("rejects approval with default reason", async () => {
    const requester = await createTestUser();
    const approver = asAdminUser(await createTestUser());

    const approval = await approvalService.submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: uniqueEntityId("test-approval-default-reject"),
      },
      requester.id,
    );

    const rejected = await approvalService.rejectApprovalService(approval.id, {}, approver);

    expect(rejected.status).toBe("REJECTED");
    expect(rejected.rejectReason).toBe("Reddedildi.");
    expect(rejected.decisionNote).toBeNull();
  });

  it("cancels approval", async () => {
    const user = await createTestUser();

    const approval = await approvalService.submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: uniqueEntityId("test-approval-cancel"),
      },
      user.id,
    );

    const cancelled = await approvalService.cancelApprovalService(approval.id, user);

    expect(cancelled.status).toBe("CANCELLED");
    expect(cancelled.decidedAt).toBeTruthy();
  });

  it("throws when approving missing approval", async () => {
    const approver = asAdminUser(await createTestUser());

    await expect(approvalService.approveApprovalService("missing-id", {}, approver)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("throws when rejecting missing approval", async () => {
    const approver = asAdminUser(await createTestUser());

    await expect(approvalService.rejectApprovalService("missing-id", {}, approver)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("throws when cancelling missing approval", async () => {
    const user = await createTestUser();

    await expect(approvalService.cancelApprovalService("missing-id", user)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
