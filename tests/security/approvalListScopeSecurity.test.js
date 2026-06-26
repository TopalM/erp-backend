import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { submitApprovalService } from "../../src/modules/platform/approval/approval.service.js";

const APPROVAL_READ = PERMISSIONS.APPROVAL_READ || "approval.read";

const createUserWithApprovalRead = () =>
  createTestUser({
    permissions: [APPROVAL_READ],
  });

const entityId = (prefix) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

describe("approval list scope security", () => {
  it("does not expose unrelated approvals to regular user", async () => {
    const requester = await createUserWithApprovalRead();
    const approver = await createUserWithApprovalRead();
    const stranger = await createUserWithApprovalRead();

    const approval = await submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: entityId("approval-list-unrelated"),
        approverId: approver.id,
      },
      requester.id,
    );

    const listRes = await api().get("/api/approvals").set("Authorization", authHeader(stranger));

    expect(listRes.status).toBe(200);

    const ids = listRes.body.data.map((item) => item.id);
    expect(ids).not.toContain(approval.id);
  });

  it("allows requester to see own approval", async () => {
    const requester = await createUserWithApprovalRead();
    const approver = await createUserWithApprovalRead();

    const approval = await submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: entityId("approval-list-requester"),
        approverId: approver.id,
      },
      requester.id,
    );

    const listRes = await api().get("/api/approvals").set("Authorization", authHeader(requester));

    expect(listRes.status).toBe(200);

    const ids = listRes.body.data.map((item) => item.id);
    expect(ids).toContain(approval.id);
  });

  it("allows assigned approver to see approval", async () => {
    const requester = await createUserWithApprovalRead();
    const approver = await createUserWithApprovalRead();

    const approval = await submitApprovalService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: entityId("approval-list-approver"),
        approverId: approver.id,
      },
      requester.id,
    );

    const listRes = await api().get("/api/approvals").set("Authorization", authHeader(approver));

    expect(listRes.status).toBe(200);

    const ids = listRes.body.data.map((item) => item.id);
    expect(ids).toContain(approval.id);
  });
});
