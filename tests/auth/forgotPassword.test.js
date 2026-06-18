import bcrypt from "bcryptjs";
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/database/prisma.client.js";

const testEmail = "forgot-password-test@plastifay.com.tr";
const password = "Test12345";

// Forgot password testleri için kullanıcı oluşturur.
const createForgotPasswordUser = async () => {
  const viewerRole = await prisma.role.findUnique({
    where: {
      name: "VIEWER",
    },
  });

  expect(viewerRole).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      firstName: "Forgot",
      lastName: "Password",
      email: testEmail,
      passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      roleId: viewerRole.id,
    },
  });
};

describe("Auth Forgot Password Tests", () => {
  // Her testten önce forgot password test kullanıcısını temizler.
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

  // Kayıtlı email adresi için şifre sıfırlama tokenı oluşturulmalı ve mail gönderilmelidir.
  it("should create password reset token for registered email", async () => {
    await createForgotPasswordUser();

    const response = await request(app).post("/api/auth/forgot-password").send({
      email: testEmail,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const user = await prisma.user.findUnique({
      where: {
        email: testEmail,
      },
    });

    expect(user.passwordResetToken).toBeTruthy();
    expect(user.passwordResetExpires).toBeTruthy();
  });

  // Kayıtlı olmayan email adresinde bilgi sızdırılmamalıdır.
  // Güvenlik nedeniyle yine başarılı genel mesaj dönmelidir.
  it("should not reveal whether email exists", async () => {
    const response = await request(app).post("/api/auth/forgot-password").send({
      email: "not-found@plastifay.com.tr",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // Geçersiz email formatı reddedilmelidir.
  it("should reject invalid email format", async () => {
    const response = await request(app).post("/api/auth/forgot-password").send({
      email: "invalid-email",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
