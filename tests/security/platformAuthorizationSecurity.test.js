import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";

import { prisma } from "../../src/database/prisma.client.js";

import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("platform authorization security", () => {
  it("does not allow plain authenticated user to list approvals", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/approvals").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("does not allow plain authenticated user to submit approval", async () => {
    const user = await createTestUser();

    const res = await api().post("/api/approvals/submit").set("Authorization", authHeader(user)).send({
      module: "PURCHASING",
      entityType: "PURCHASE_REQUEST",
      entityId: "security-test-entity",
    });

    expect(res.status).toBe(403);
  });

  it("does not allow plain authenticated user to list assignments", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/assignments").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("does not allow plain authenticated user to create assignment", async () => {
    const user = await createTestUser();

    const res = await api().post("/api/assignments").set("Authorization", authHeader(user)).send({
      module: "PURCHASING",
      entityType: "PURCHASE_REQUEST",
      entityId: "security-test-entity",
      userId: user.id,
      role: "RESPONSIBLE",
    });

    expect(res.status).toBe(403);
  });

  it("allows user with approval read permission to list approvals", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_READ],
    });

    const res = await api().get("/api/approvals").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("allows user with approval create permission to submit approval", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const res = await api()
      .post("/api/approvals/submit")
      .set("Authorization", authHeader(user))
      .send({
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `approval-security-${Date.now()}`,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.module).toBe("PURCHASING");
  });

  it("allows user with assignment read permission to list assignments", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_READ],
    });

    const res = await api().get("/api/assignments").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("allows user with assignment create permission to create assignment", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });

    const res = await api()
      .post("/api/assignments")
      .set("Authorization", authHeader(user))
      .send({
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `assignment-security-${Date.now()}`,
        userId: user.id,
        role: "RESPONSIBLE",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.module).toBe("PURCHASING");
    expect(res.body.data.userId).toBe(user.id);
  });

  it("does not allow plain authenticated user to approve approval", async () => {
    const owner = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const attacker = await createTestUser();

    const approval = await prisma.approval.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `approval-approve-security-${Date.now()}`,
        status: "PENDING",
        requestedById: owner.id,
      },
    });

    const res = await api().patch(`/api/approvals/${approval.id}/approve`).set("Authorization", authHeader(attacker)).send({
      decisionNote: "unauthorized approve attempt",
    });

    expect(res.status).toBe(403);
  });

  it("does not allow plain authenticated user to reject approval", async () => {
    const owner = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const attacker = await createTestUser();

    const approval = await prisma.approval.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `approval-reject-security-${Date.now()}`,
        status: "PENDING",
        requestedById: owner.id,
      },
    });

    const res = await api().patch(`/api/approvals/${approval.id}/reject`).set("Authorization", authHeader(attacker)).send({
      rejectReason: "unauthorized reject attempt",
    });

    expect(res.status).toBe(403);
  });

  it("does not allow plain authenticated user to cancel approval", async () => {
    const owner = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const attacker = await createTestUser();

    const approval = await prisma.approval.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `approval-cancel-security-${Date.now()}`,
        status: "PENDING",
        requestedById: owner.id,
      },
    });

    const res = await api().patch(`/api/approvals/${approval.id}/cancel`).set("Authorization", authHeader(attacker)).send({
      decisionNote: "unauthorized cancel attempt",
    });

    expect(res.status).toBe(403);
  });

  it("allows user with approval decide permission to approve approval", async () => {
    const owner = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const approver = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const approval = await prisma.approval.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `approval-positive-approve-${Date.now()}`,
        status: "PENDING",
        requestedById: owner.id,
        approverId: approver.id,
      },
    });

    const res = await api().patch(`/api/approvals/${approval.id}/approve`).set("Authorization", authHeader(approver)).send({
      decisionNote: "approved by authorized user",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("APPROVED");
  });

  it("allows user with approval decide permission to reject approval", async () => {
    const owner = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const approver = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const approval = await prisma.approval.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `approval-positive-reject-${Date.now()}`,
        status: "PENDING",
        requestedById: owner.id,
        approverId: approver.id,
      },
    });

    const res = await api().patch(`/api/approvals/${approval.id}/reject`).set("Authorization", authHeader(approver)).send({
      rejectReason: "rejected by authorized user",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("REJECTED");
  });

  it("allows requester with approval cancel permission to cancel approval", async () => {
    const requester = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CANCEL],
    });

    const approval = await prisma.approval.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `approval-positive-cancel-${Date.now()}`,
        status: "PENDING",
        requestedById: requester.id,
      },
    });

    const res = await api().patch(`/api/approvals/${approval.id}/cancel`).set("Authorization", authHeader(requester)).send({
      decisionNote: "cancelled by authorized requester",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CANCELLED");
  });

  it("does not allow approval decide user to approve approval assigned to another approver", async () => {
    const owner = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const realApprover = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const attackerApprover = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const approval = await prisma.approval.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `approval-idor-approve-${Date.now()}`,
        status: "PENDING",
        requestedById: owner.id,
        approverId: realApprover.id,
      },
    });

    const res = await api().patch(`/api/approvals/${approval.id}/approve`).set("Authorization", authHeader(attackerApprover)).send({
      decisionNote: "IDOR approve attempt",
    });

    expect(res.status).toBe(403);
  });

  it("does not allow approval decide user to reject approval assigned to another approver", async () => {
    const owner = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const realApprover = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const attackerApprover = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_DECIDE],
    });

    const approval = await prisma.approval.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `approval-idor-reject-${Date.now()}`,
        status: "PENDING",
        requestedById: owner.id,
        approverId: realApprover.id,
      },
    });

    const res = await api().patch(`/api/approvals/${approval.id}/reject`).set("Authorization", authHeader(attackerApprover)).send({
      rejectReason: "IDOR reject attempt",
    });

    expect(res.status).toBe(403);
  });

  it("does not allow plain authenticated user to update assignment", async () => {
    const owner = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });

    const attacker = await createTestUser();

    const assignment = await prisma.assignment.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `assignment-update-security-${Date.now()}`,
        userId: owner.id,
        role: "RESPONSIBLE",
        createdById: owner.id,
      },
    });

    const res = await api().patch(`/api/assignments/${assignment.id}`).set("Authorization", authHeader(attacker)).send({
      role: "APPROVER",
      note: "unauthorized update attempt",
    });

    expect(res.status).toBe(403);
  });

  it("does not allow plain authenticated user to delete assignment", async () => {
    const owner = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });

    const attacker = await createTestUser();

    const assignment = await prisma.assignment.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `assignment-delete-security-${Date.now()}`,
        userId: owner.id,
        role: "RESPONSIBLE",
        createdById: owner.id,
      },
    });

    const res = await api().delete(`/api/assignments/${assignment.id}`).set("Authorization", authHeader(attacker));

    expect(res.status).toBe(403);
  });

  it("allows user with assignment update permission to update assignment", async () => {
    const updater = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE, PERMISSIONS.ASSIGNMENT_UPDATE],
    });

    const assignment = await prisma.assignment.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `assignment-positive-update-${Date.now()}`,
        userId: updater.id,
        role: "RESPONSIBLE",
        createdById: updater.id,
      },
    });

    const res = await api().patch(`/api/assignments/${assignment.id}`).set("Authorization", authHeader(updater)).send({
      role: "APPROVER",
      note: "authorized update",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe("APPROVER");
    expect(res.body.data.note).toBe("authorized update");
  });

  it("allows user with assignment delete permission to delete assignment", async () => {
    const deleter = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE, PERMISSIONS.ASSIGNMENT_DELETE],
    });

    const assignment = await prisma.assignment.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `assignment-positive-delete-${Date.now()}`,
        userId: deleter.id,
        role: "RESPONSIBLE",
        createdById: deleter.id,
      },
    });

    const res = await api().delete(`/api/assignments/${assignment.id}`).set("Authorization", authHeader(deleter));

    expect(res.status).toBe(200);

    const deleted = await prisma.assignment.findUnique({
      where: { id: assignment.id },
    });

    expect(deleted).toBeNull();
  });

  it("does not allow assignment update user to update assignment created by another user", async () => {
    const owner = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });

    const attacker = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_UPDATE],
    });

    const assignment = await prisma.assignment.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `assignment-idor-update-${Date.now()}`,
        userId: owner.id,
        role: "RESPONSIBLE",
        createdById: owner.id,
      },
    });

    const res = await api().patch(`/api/assignments/${assignment.id}`).set("Authorization", authHeader(attacker)).send({
      role: "APPROVER",
      note: "IDOR update attempt",
    });

    expect(res.status).toBe(403);
  });

  it("does not allow assignment delete user to delete assignment created by another user", async () => {
    const owner = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });

    const attacker = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_DELETE],
    });

    const assignment = await prisma.assignment.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `assignment-idor-delete-${Date.now()}`,
        userId: owner.id,
        role: "RESPONSIBLE",
        createdById: owner.id,
      },
    });

    const res = await api().delete(`/api/assignments/${assignment.id}`).set("Authorization", authHeader(attacker));

    expect(res.status).toBe(403);

    const existing = await prisma.assignment.findUnique({
      where: { id: assignment.id },
    });

    expect(existing).toBeTruthy();
  });
});
