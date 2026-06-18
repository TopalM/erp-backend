import bcrypt from "bcryptjs";
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/database/prisma.client.js";

const testEmail = "verify-test@plastifay.com.tr";
const verificationToken = "test-verification-token";

describe("Auth Verify Email Tests", () => {
  // Her testten önce doğrulama testi için kullanıcıyı doğrudan veritabanında oluşturur.
  // Bu test mail göndermez; sadece verify-email endpoint davranışını test eder.
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

    const viewerRole = await prisma.role.findUnique({
      where: {
        name: "VIEWER",
      },
    });

    expect(viewerRole).toBeTruthy();

    const passwordHash = await bcrypt.hash("Test12345", 10);

    await prisma.user.create({
      data: {
        firstName: "Verify",
        lastName: "Test",
        email: testEmail,
        passwordHash,
        isActive: false,
        roleId: viewerRole.id,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  });

  // Geçerli doğrulama tokenı ile email doğrulanabilmelidir.
  it("should verify email with valid token", async () => {
    const response = await request(app).get(`/api/auth/verify-email/${verificationToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(testEmail);

    const verifiedUser = await prisma.user.findUnique({
      where: {
        email: testEmail,
      },
    });

    expect(verifiedUser.emailVerifiedAt).toBeTruthy();
    expect(verifiedUser.emailVerificationToken).toBeNull();
    expect(verifiedUser.emailVerificationExpires).toBeNull();
  });

  // Geçersiz token ile email doğrulama yapılamamalıdır.
  it("should reject invalid verification token", async () => {
    const response = await request(app).get("/api/auth/verify-email/invalid-token");

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
