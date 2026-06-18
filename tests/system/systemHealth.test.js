import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const superAdminEmail = "system-health-super-admin-test@plastifay.com.tr";
const adminEmail = "system-health-admin-test@plastifay.com.tr";
const viewerEmail = "system-health-viewer-test@plastifay.com.tr";
const password = "Test12345";

const createUserWithRole = async ({ email, roleName }) => {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "System",
      lastName: "Health Test",
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

describe("System Health Tests", () => {
  beforeEach(async () => {
    const emails = [superAdminEmail, adminEmail, viewerEmail];

    await prisma.authEventLog.deleteMany({
      where: { email: { in: emails } },
    });

    await prisma.user.deleteMany({
      where: { email: { in: emails } },
    });
  });

  it("should allow admin to get system health", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).get("/api/system/health").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.backend).toBe("online");
    expect(response.body.data.database).toBe("connected");
    expect(response.body.data.memory).toBeTruthy();
  });

  it("should allow super admin to get system health", async () => {
    const { token } = await createUserWithRole({
      email: superAdminEmail,
      roleName: ROLES.SUPER_ADMIN,
    });

    const response = await request(app).get("/api/system/health").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should reject viewer from system health", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).get("/api/system/health").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should reject system health without token", async () => {
    const response = await request(app).get("/api/system/health");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
