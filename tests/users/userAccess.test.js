import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const superAdminEmail = "user-access-super-admin-test@plastifay.com.tr";
const adminEmail = "user-access-admin-test@plastifay.com.tr";
const viewerEmail = "user-access-viewer-test@plastifay.com.tr";
const pendingEmail = "user-access-pending-test@plastifay.com.tr";
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
      lastName: "Access Test",
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

describe("User Access Tests", () => {
  beforeEach(async () => {
    const emails = [superAdminEmail, adminEmail, viewerEmail, pendingEmail];

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

  // ADMIN kullanıcı tüm kullanıcıları listeleyebilmelidir.
  it("should allow admin to list users", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    await createUserWithRole({
      email: pendingEmail,
      roleName: ROLES.VIEWER,
      isActive: false,
    });

    const response = await request(app).get("/api/users").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // Token olmadan kullanıcı listesi görüntülenememelidir.
  it("should reject list users without token", async () => {
    const response = await request(app).get("/api/users");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // VIEWER kullanıcı tüm kullanıcıları listeleyememelidir.
  it("should reject viewer from listing users", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).get("/api/users").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı onay bekleyen kullanıcıları listeleyebilmelidir.
  it("should allow admin to list pending users", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    await createUserWithRole({
      email: pendingEmail,
      roleName: ROLES.VIEWER,
      isActive: false,
    });

    const response = await request(app).get("/api/users/pending").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // Token olmadan onay bekleyen kullanıcı listesi görüntülenememelidir.
  it("should reject list pending users without token", async () => {
    const response = await request(app).get("/api/users/pending");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // VIEWER kullanıcı onay bekleyen kullanıcıları listeleyememelidir.
  it("should reject viewer from listing pending users", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).get("/api/users/pending").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // SUPER_ADMIN kullanıcı tüm kullanıcıları listeleyebilmelidir.
  it("should allow super admin to list users", async () => {
    const { token } = await createUserWithRole({
      email: superAdminEmail,
      roleName: ROLES.SUPER_ADMIN,
    });

    await createUserWithRole({
      email: pendingEmail,
      roleName: ROLES.VIEWER,
      isActive: false,
    });

    const response = await request(app).get("/api/users").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // SUPER_ADMIN kullanıcı onay bekleyen kullanıcıları listeleyebilmelidir.
  it("should allow super admin to list pending users", async () => {
    const { token } = await createUserWithRole({
      email: superAdminEmail,
      roleName: ROLES.SUPER_ADMIN,
    });

    await createUserWithRole({
      email: pendingEmail,
      roleName: ROLES.VIEWER,
      isActive: false,
    });

    const response = await request(app).get("/api/users/pending").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
