import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const superAdminEmail = "audit-log-super-admin-test@plastifay.com.tr";
const adminEmail = "audit-log-admin-test@plastifay.com.tr";
const viewerEmail = "audit-log-viewer-test@plastifay.com.tr";
const password = "Test12345";

const createUserWithRole = async ({ email, roleName }) => {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Audit",
      lastName: "Log Test",
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

describe("Audit Log Tests", () => {
  beforeEach(async () => {
    const emails = [superAdminEmail, adminEmail, viewerEmail];

    await prisma.auditLog.deleteMany({
      where: {
        OR: [{ actorEmail: { in: emails } }, { message: { contains: "Audit log test" } }],
      },
    });

    await prisma.authEventLog.deleteMany({
      where: { email: { in: emails } },
    });

    await prisma.user.deleteMany({
      where: { email: { in: emails } },
    });
  });

  it("should allow super admin to list audit logs", async () => {
    const { token } = await createUserWithRole({
      email: superAdminEmail,
      roleName: ROLES.SUPER_ADMIN,
    });

    await prisma.auditLog.create({
      data: {
        actorEmail: superAdminEmail,
        entityType: "SYSTEM",
        action: "CREATE",
        message: "Audit log test list",
      },
    });

    const response = await request(app).get("/api/audit-logs").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("should reject admin from listing audit logs", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).get("/api/audit-logs").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should reject viewer from listing audit logs", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).get("/api/audit-logs").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should reject audit logs without token", async () => {
    const response = await request(app).get("/api/audit-logs");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should allow super admin to delete audit logs", async () => {
    const { token } = await createUserWithRole({
      email: superAdminEmail,
      roleName: ROLES.SUPER_ADMIN,
    });

    await prisma.auditLog.create({
      data: {
        actorEmail: superAdminEmail,
        entityType: "SYSTEM",
        action: "CREATE",
        message: "Audit log test delete",
      },
    });

    const response = await request(app).delete("/api/audit-logs").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.deletedCount).toBeGreaterThanOrEqual(1);
  });
});
