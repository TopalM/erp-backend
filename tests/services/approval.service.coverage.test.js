import { describe, it, expect, beforeEach } from "vitest";
import { ApprovalModule, ApprovalEntityType } from "@prisma/client";

import * as service from "../../src/modules/platform/approval/approval.service.js";
import { prisma } from "../../src/database/prisma.client.js";

const moduleValue = Object.values(ApprovalModule)[0];
const entityTypeValue = Object.values(ApprovalEntityType)[0];

const uniqueEmail = () => `approval-coverage-${Date.now()}-${Math.random()}@plastifay.com.tr`;
const uniqueEntityId = () => `approval-entity-${Date.now()}-${Math.random()}`;

const getViewerRole = async () => {
  const role = await prisma.role.findUnique({ where: { name: "VIEWER" } });
  if (!role) throw new Error("VIEWER role seed edilmemiş.");
  return role;
};

const createUser = async () => {
  const role = await getViewerRole();

  return prisma.user.create({
    data: {
      firstName: "Approval",
      lastName: "USER",
      email: uniqueEmail(),
      passwordHash: "test-hash",
      isActive: true,
      emailVerifiedAt: new Date(),
      roleId: role.id,
    },
  });
};

const createApproval = async () => {
  const requester = await createUser();
  const approver = await createUser();

  const approval = await prisma.approval.create({
    data: {
      module: moduleValue,
      entityType: entityTypeValue,
      entityId: uniqueEntityId(),
      status: "PENDING",
      requestedById: requester.id,
      approverId: approver.id,
      decisionNote: "Initial approval",
    },
  });

  return { approval, requester, approver };
};

beforeEach(async () => {
  await prisma.approval.deleteMany({
    where: {
      entityId: {
        contains: "approval-entity-",
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "approval-coverage-",
      },
    },
  });
});

describe("approval.service coverage", () => {
  it("lists approvals with filters", async () => {
    const { approval, requester, approver } = await createApproval();

    const result = await service.listApprovalsService({
      module: approval.module,
      entityType: approval.entityType,
      entityId: approval.entityId,
      status: "PENDING",
      approverId: approver.id,
      requestedById: requester.id,
    });

    expect(result.some((item) => item.id === approval.id)).toBe(true);
  });

  it("submits approval with upsert", async () => {
    const requester = await createUser();
    const approver = await createUser();
    const entityId = uniqueEntityId();

    const result = await service.submitApprovalService(
      {
        module: moduleValue,
        entityType: entityTypeValue,
        entityId,
        approverId: approver.id,
        decisionNote: "Please approve",
      },
      requester.id,
    );

    expect(result).toBeTruthy();
    expect(result.status).toBe("PENDING");
    expect(result.entityId).toBe(entityId);
    expect(result.requestedById).toBe(requester.id);
    expect(result.approverId).toBe(approver.id);
  });

  it("approves approval", async () => {
    const { approval, approver } = await createApproval();

    const result = await service.approveApprovalService(
      approval.id,
      {
        decisionNote: "Approved",
      },
      approver.id,
    );

    expect(result.status).toBe("APPROVED");
    expect(result.decisionNote).toBe("Approved");
    expect(result.rejectReason).toBeNull();
    expect(result.approverId).toBe(approver.id);
    expect(result.decidedAt).toBeTruthy();
  });

  it("rejects approval", async () => {
    const { approval, approver } = await createApproval();

    const result = await service.rejectApprovalService(
      approval.id,
      {
        decisionNote: "Rejected",
        rejectReason: "Missing data",
      },
      approver.id,
    );

    expect(result.status).toBe("REJECTED");
    expect(result.decisionNote).toBe("Rejected");
    expect(result.rejectReason).toBe("Missing data");
    expect(result.approverId).toBe(approver.id);
    expect(result.decidedAt).toBeTruthy();
  });

  it("cancels approval", async () => {
    const { approval } = await createApproval();

    const result = await service.cancelApprovalService(approval.id);

    expect(result.status).toBe("CANCELLED");
  });

  it("updates existing approval on submit", async () => {
    const requester = await createUser();
    const approver = await createUser();
    const entityId = uniqueEntityId();

    await service.submitApprovalService(
      {
        module: moduleValue,
        entityType: entityTypeValue,
        entityId,
        approverId: approver.id,
        decisionNote: "First",
      },
      requester.id,
    );

    const result = await service.submitApprovalService(
      {
        module: moduleValue,
        entityType: entityTypeValue,
        entityId,
      },
      null,
    );

    expect(result.status).toBe("PENDING");
    expect(result.requestedById).toBeNull();
    expect(result.approverId).toBeNull();
    expect(result.decisionNote).toBeNull();
    expect(result.rejectReason).toBeNull();
    expect(result.decidedAt).toBeNull();
  });

  it("approves with fallback approver and nullable decision note", async () => {
    const { approval } = await createApproval();

    await prisma.approval.update({
      where: { id: approval.id },
      data: { approverId: null },
    });

    const user = await createUser();

    const result = await service.approveApprovalService(approval.id, {}, user.id);

    expect(result.status).toBe("APPROVED");
    expect(result.approverId).toBe(user.id);
    expect(result.decisionNote).toBeNull();
    expect(result.rejectReason).toBeNull();
  });

  it("rejects with default reject reason and nullable decision note", async () => {
    const { approval } = await createApproval();

    const result = await service.rejectApprovalService(approval.id, {});

    expect(result.status).toBe("REJECTED");
    expect(result.decisionNote).toBeNull();
    expect(result.rejectReason).toBe("Reddedildi.");
  });

  it("throws when approving missing approval", async () => {
    await expect(service.approveApprovalService("missing-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("throws when rejecting missing approval", async () => {
    await expect(service.rejectApprovalService("missing-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("throws when cancelling missing approval", async () => {
    await expect(service.cancelApprovalService("missing-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
