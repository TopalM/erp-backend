import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const adminEmail = "user-permissions-admin-test@plastifay.com.tr";
const targetEmail = "user-permissions-target-test@plastifay.com.tr";
const viewerEmail = "user-permissions-viewer-test@plastifay.com.tr";
const password = "Test12345";

const createUserWithRole = async ({ email, roleName }) => {
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
      lastName: "Permission Test",
      email,
      passwordHash,
      isActive: true,
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

describe("User Permission Management Tests", () => {
  beforeEach(async () => {
    const emails = [adminEmail, targetEmail, viewerEmail];

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

  // ADMIN kullanıcı, hedef kullanıcının yetkilerini görüntüleyebilmelidir.
  it("should allow admin to get user permissions", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).get(`/api/permissions/user/${targetUser.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // Token olmadan kullanıcı yetkileri görüntülenememelidir.
  it("should reject get user permissions without token", async () => {
    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).get(`/api/permissions/user/${targetUser.id}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // VIEWER kullanıcı, başka kullanıcının yetkilerini görüntüleyememelidir.
  it("should reject viewer from getting user permissions", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).get(`/api/permissions/user/${targetUser.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı, hedef kullanıcının yetkilerini güncelleyebilmelidir.
  it("should allow admin to update user permissions", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
    });

    const permission = await prisma.permission.findFirst({
      orderBy: {
        code: "asc",
      },
    });

    expect(permission).toBeTruthy();

    const response = await request(app)
      .put(`/api/permissions/user/${targetUser.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        permissions: [
          {
            permissionId: permission.id,
            effect: "ALLOW",
          },
        ],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const userPermission = await prisma.userPermission.findFirst({
      where: {
        userId: targetUser.id,
        permissionId: permission.id,
        effect: "ALLOW",
      },
    });

    expect(userPermission).toBeTruthy();
  });

  // Olmayan kullanıcı için yetki güncelleme 404 dönmelidir.
  it("should reject update permissions for unknown user", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const permission = await prisma.permission.findFirst({
      orderBy: {
        code: "asc",
      },
    });

    expect(permission).toBeTruthy();

    const response = await request(app)
      .put("/api/permissions/user/unknown-user-id")
      .set("Authorization", `Bearer ${token}`)
      .send({
        permissions: [
          {
            permissionId: permission.id,
            effect: "ALLOW",
          },
        ],
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
