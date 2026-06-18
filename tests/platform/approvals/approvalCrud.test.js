import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { env } from "../../../src/config/env.js";
import { prisma } from "../../../src/database/prisma.client.js";
import { ROLES } from "../../../src/constants/roles.js";

const requesterEmail = "approval-requester-test@plastifay.com.tr";
const approverEmail = "approval-approver-test@plastifay.com.tr";
const password = "Test12345";
const testEntityId = "approval-test-entity-001";

const createUser = async ({ email, roleName = ROLES.ADMIN }) => {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Approval",
      lastName: "Test",
      email,
      passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      tokenVersion: 0,
      roleId: role.id,
    },
    include: { role: true },
  });

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      departmentId: user.departmentId,
      tokenVersion: user.tokenVersion,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn },
  );

  return { user, token };
};

describe("Approval Platform Tests", () => {
  beforeEach(async () => {
    const emails = [requesterEmail, approverEmail];

    await prisma.approval.deleteMany({
      where: {
        entityId: {
          contains: "approval-test-entity",
        },
      },
    });

    await prisma.authEventLog.deleteMany({
      where: {
        email: {
          in: emails,
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: emails,
        },
      },
    });
  });

  it("should submit an approval request", async () => {
    const { token } = await createUser({ email: requesterEmail });
    const { user: approver } = await createUser({ email: approverEmail });

    const response = await request(app)
      .post("/api/approvals/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: testEntityId,
        approverId: approver.id,
        decisionNote: "Satınalma talebi onaya gönderildi.",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("PENDING");
    expect(response.body.data.entityId).toBe(testEntityId);
    expect(response.body.data.approverId).toBe(approver.id);
  });

  it("should list approval requests", async () => {
    const { token } = await createUser({ email: requesterEmail });

    await prisma.approval.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: testEntityId,
        status: "PENDING",
      },
    });

    const response = await request(app)
      .get("/api/approvals")
      .query({ module: "PURCHASING", entityType: "PURCHASE_REQUEST" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.some((item) => item.entityId === testEntityId)).toBe(true);
  });

  it("should approve a pending approval", async () => {
    const { token, user } = await createUser({ email: approverEmail });

    const approval = await prisma.approval.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: testEntityId,
        status: "PENDING",
      },
    });

    const response = await request(app)
      .patch(`/api/approvals/${approval.id}/approve`)
      .set("Authorization", `Bearer ${token}`)
      .send({ decisionNote: "Uygundur." });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("APPROVED");
    expect(response.body.data.approverId).toBe(user.id);
    expect(response.body.data.decidedAt).toBeTruthy();
  });

  it("should reject a pending approval", async () => {
    const { token } = await createUser({ email: approverEmail });

    const approval = await prisma.approval.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: testEntityId,
        status: "PENDING",
      },
    });

    const response = await request(app)
      .patch(`/api/approvals/${approval.id}/reject`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rejectReason: "Eksik bilgi var." });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("REJECTED");
    expect(response.body.data.rejectReason).toBe("Eksik bilgi var.");
  });

  it("should cancel an approval process", async () => {
    const { token } = await createUser({ email: requesterEmail });

    const approval = await prisma.approval.create({
      data: {
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: testEntityId,
        status: "PENDING",
      },
    });

    const response = await request(app)
      .patch(`/api/approvals/${approval.id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("CANCELLED");
  });

  it("should reject approval list without token", async () => {
    const response = await request(app).get("/api/approvals");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
