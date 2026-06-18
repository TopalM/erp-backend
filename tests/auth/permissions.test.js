import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const adminEmail = "permissions-admin-test@plastifay.com.tr";
const viewerEmail = "permissions-viewer-test@plastifay.com.tr";
const password = "Test12345";

// Belirtilen role sahip test kullanıcısı oluşturur.
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
      firstName: "Permission",
      lastName: "Test",
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

describe("Permission Tests", () => {
  // Her testten önce permission test kullanıcılarını temizler.
  beforeEach(async () => {
    const emails = [adminEmail, viewerEmail];

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

  // ADMIN rolüne sahip kullanıcı permission listesini görebilmelidir.
  it("should allow admin to list permissions", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).get("/api/permissions").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // Token olmadan permission listesi görüntülenememelidir.
  it("should reject permissions request without token", async () => {
    const response = await request(app).get("/api/permissions");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // VIEWER rolüne sahip kullanıcı permission listesini görememelidir.
  it("should reject viewer from listing permissions", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).get("/api/permissions").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
