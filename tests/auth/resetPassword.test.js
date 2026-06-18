import bcrypt from "bcryptjs";
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/database/prisma.client.js";

const testEmail = "reset-password-test@plastifay.com.tr";
const oldPassword = "Test12345!";
const newPassword = "NewTest12345!";
const validResetToken = "valid-reset-token";
const expiredResetToken = "expired-reset-token";

// Reset password testleri için kullanıcı oluşturur.
const createResetPasswordUser = async ({ token = validResetToken, expiresAt = new Date(Date.now() + 60 * 60 * 1000) }) => {
  const viewerRole = await prisma.role.findUnique({
    where: {
      name: "VIEWER",
    },
  });

  expect(viewerRole).toBeTruthy();

  const passwordHash = await bcrypt.hash(oldPassword, 10);

  return prisma.user.create({
    data: {
      firstName: "Reset",
      lastName: "Password",
      email: testEmail,
      passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      roleId: viewerRole.id,
      passwordResetToken: token,
      passwordResetExpires: expiresAt,
    },
  });
};

describe("Auth Reset Password Tests", () => {
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

  it("should reset password with valid token", async () => {
    await createResetPasswordUser({});

    const response = await request(app).post("/api/auth/reset-password").send({
      token: validResetToken,
      password: newPassword,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const user = await prisma.user.findUnique({
      where: {
        email: testEmail,
      },
    });

    expect(user.passwordResetToken).toBeNull();
    expect(user.passwordResetExpires).toBeNull();

    const isNewPasswordValid = await bcrypt.compare(newPassword, user.passwordHash);

    expect(isNewPasswordValid).toBe(true);
  });

  it("should reject invalid reset token", async () => {
    await createResetPasswordUser({});

    const response = await request(app).post("/api/auth/reset-password").send({
      token: "invalid-reset-token",
      password: newPassword,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject expired reset token", async () => {
    await createResetPasswordUser({
      token: expiredResetToken,
      expiresAt: new Date(Date.now() - 60 * 60 * 1000),
    });

    const response = await request(app).post("/api/auth/reset-password").send({
      token: expiredResetToken,
      password: newPassword,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject weak new password", async () => {
    await createResetPasswordUser({});

    const response = await request(app).post("/api/auth/reset-password").send({
      token: validResetToken,
      password: "123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject password without special character", async () => {
    await createResetPasswordUser({});

    const response = await request(app).post("/api/auth/reset-password").send({
      token: validResetToken,
      password: "NewTest12345",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
