import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const superAdminEmail = "user-management-super-admin-test@plastifay.com.tr";
const adminEmail = "user-management-admin-test@plastifay.com.tr";
const targetEmail = "user-management-target-test@plastifay.com.tr";
const viewerEmail = "user-management-viewer-test@plastifay.com.tr";
const password = "Test12345";

const createUserWithRole = async ({ email, roleName, isActive = true }) => {
  const role = await prisma.role.findUnique({
    where: {
      name: roleName,
    },
  });

  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "User",
      lastName: "Management Test",
      email,
      passwordHash,
      isActive,
      emailVerifiedAt: new Date(),
      tokenVersion: 0,
      roleId: role.id,
    },
    include: {
      role: true,
    },
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
    {
      expiresIn: env.jwt.expiresIn,
    },
  );

  return {
    user,
    token,
  };
};

describe("User Management Tests", () => {
  beforeEach(async () => {
    const emails = [superAdminEmail, adminEmail, targetEmail, viewerEmail];

    const users = await prisma.user.findMany({
      where: {
        email: {
          in: emails,
        },
      },
      select: {
        id: true,
      },
    });

    await prisma.userPermission.deleteMany({
      where: {
        userId: {
          in: users.map((user) => user.id),
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

  it("should allow admin to activate user", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
      isActive: false,
    });

    const response = await request(app).patch(`/api/users/${targetUser.id}/activate`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.isActive).toBe(true);

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: targetUser.id,
      },
    });

    expect(updatedUser.isActive).toBe(true);
    expect(updatedUser.tokenVersion).toBe(targetUser.tokenVersion + 1);
  });

  it("should reject activate for unknown user", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).patch("/api/users/unknown-user-id/activate").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should reject viewer from activating user", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
      isActive: false,
    });

    const response = await request(app).patch(`/api/users/${targetUser.id}/activate`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should allow super admin to activate user", async () => {
    const { token } = await createUserWithRole({
      email: superAdminEmail,
      roleName: ROLES.SUPER_ADMIN,
    });

    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
      isActive: false,
    });

    const response = await request(app).patch(`/api/users/${targetUser.id}/activate`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.isActive).toBe(true);
  });

  it("should allow admin to deactivate user", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).patch(`/api/users/${targetUser.id}/deactivate`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.isActive).toBe(false);
  });

  it("should allow admin to update user role", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
    });

    const adminRole = await prisma.role.findUnique({
      where: {
        name: ROLES.ADMIN,
      },
    });

    const response = await request(app).patch(`/api/users/${targetUser.id}/role`).set("Authorization", `Bearer ${token}`).send({
      roleId: adminRole.id,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.role.name).toBe(ROLES.ADMIN);
  });

  it("should allow super admin to update user role", async () => {
    const { token } = await createUserWithRole({
      email: superAdminEmail,
      roleName: ROLES.SUPER_ADMIN,
    });

    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
    });

    const adminRole = await prisma.role.findUnique({
      where: {
        name: ROLES.ADMIN,
      },
    });

    const response = await request(app).patch(`/api/users/${targetUser.id}/role`).set("Authorization", `Bearer ${token}`).send({
      roleId: adminRole.id,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.role.name).toBe(ROLES.ADMIN);
  });

  it("should reject role update for unknown role", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).patch(`/api/users/${targetUser.id}/role`).set("Authorization", `Bearer ${token}`).send({
      roleId: "unknown-role-id",
    });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should allow admin to force logout user", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).patch(`/api/users/${targetUser.id}/force-logout`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: targetUser.id,
      },
    });

    expect(updatedUser.tokenVersion).toBe(targetUser.tokenVersion + 1);
  });
});
