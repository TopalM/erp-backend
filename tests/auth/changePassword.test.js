import bcrypt from "bcryptjs";
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/database/prisma.client.js";
import { env } from "../../src/config/env.js";
import jwt from "jsonwebtoken";

const testEmail = "change-password-test@plastifay.com.tr";
const currentPassword = "Test12345!";
const newPassword = "NewTest12345!";

// Change password testleri için aktif ve doğrulanmış kullanıcı oluşturur.
const createChangePasswordUser = async () => {
  const viewerRole = await prisma.role.findUnique({
    where: {
      name: "VIEWER",
    },
  });

  expect(viewerRole).toBeTruthy();

  const passwordHash = await bcrypt.hash(currentPassword, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Change",
      lastName: "Password",
      email: testEmail,
      passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      roleId: viewerRole.id,
      tokenVersion: 0,
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

describe("Auth Change Password Tests", () => {
  beforeEach(async () => {
    await prisma.authEventLog.deleteMany({
      where: {
        email: testEmail,
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: testEmail,
      },
    });
  });

  it("should change password successfully", async () => {
    const { token } = await createChangePasswordUser();

    const response = await request(app).post("/api/auth/change-password").set("Authorization", `Bearer ${token}`).send({
      currentPassword,
      newPassword,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const user = await prisma.user.findUnique({
      where: {
        email: testEmail,
      },
    });

    const isNewPasswordValid = await bcrypt.compare(newPassword, user.passwordHash);

    expect(isNewPasswordValid).toBe(true);
    expect(user.tokenVersion).toBe(1);
  });

  it("should reject wrong current password", async () => {
    const { token } = await createChangePasswordUser();

    const response = await request(app).post("/api/auth/change-password").set("Authorization", `Bearer ${token}`).send({
      currentPassword: "Wrong12345!",
      newPassword,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject same password", async () => {
    const { token } = await createChangePasswordUser();

    const response = await request(app).post("/api/auth/change-password").set("Authorization", `Bearer ${token}`).send({
      currentPassword,
      newPassword: currentPassword,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject password without special character", async () => {
    const { token } = await createChangePasswordUser();

    const response = await request(app).post("/api/auth/change-password").set("Authorization", `Bearer ${token}`).send({
      currentPassword,
      newPassword: "NewTest12345",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject request without token", async () => {
    await createChangePasswordUser();

    const response = await request(app).post("/api/auth/change-password").send({
      currentPassword,
      newPassword,
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
