import bcrypt from "bcryptjs";
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/database/prisma.client.js";

const password = "Test12345";

const activeEmail = "login-active-test@plastifay.com.tr";
const unverifiedEmail = "login-unverified-test@plastifay.com.tr";
const passiveEmail = "login-passive-test@plastifay.com.tr";

// Login testleri için kullanıcı oluşturur.
const createTestUser = async ({ email, isActive = true, emailVerifiedAt = new Date() }) => {
  const viewerRole = await prisma.role.findUnique({
    where: {
      name: "VIEWER",
    },
  });

  expect(viewerRole).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      firstName: "Login",
      lastName: "Test",
      email,
      passwordHash,
      isActive,
      emailVerifiedAt,
      roleId: viewerRole.id,
    },
  });
};

describe("Auth Login Tests", () => {
  // Her testten önce login test kullanıcılarını temizler.
  beforeEach(async () => {
    const emails = [activeEmail, unverifiedEmail, passiveEmail];

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

  // Email doğrulanmış ve aktif kullanıcı başarılı şekilde giriş yapabilmelidir.
  it("should login successfully with valid credentials", async () => {
    await createTestUser({
      email: activeEmail,
      isActive: true,
      emailVerifiedAt: new Date(),
    });

    const response = await request(app).post("/api/auth/login").send({
      email: activeEmail,
      password,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data.token).toBeTruthy();
    expect(response.body.data.user.email).toBe(activeEmail);

    // Hassas bilgiler response içerisinde dönmemelidir.
    expect(response.body.data.user.passwordHash).toBeUndefined();
  });

  // Hatalı şifre ile giriş yapılamamalıdır.
  it("should reject login with wrong password", async () => {
    await createTestUser({
      email: activeEmail,
      isActive: true,
      emailVerifiedAt: new Date(),
    });

    const response = await request(app).post("/api/auth/login").send({
      email: activeEmail,
      password: "Wrong12345",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // Email doğrulanmamış kullanıcı giriş yapamamalıdır.
  it("should reject login when email is not verified", async () => {
    await createTestUser({
      email: unverifiedEmail,
      isActive: true,
      emailVerifiedAt: null,
    });

    const response = await request(app).post("/api/auth/login").send({
      email: unverifiedEmail,
      password,
    });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // Pasif kullanıcı giriş yapamamalıdır.
  it("should reject login when user is passive", async () => {
    await createTestUser({
      email: passiveEmail,
      isActive: false,
      emailVerifiedAt: new Date(),
    });

    const response = await request(app).post("/api/auth/login").send({
      email: passiveEmail,
      password,
    });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // Beş hatalı giriş denemesi sonrası kullanıcı geçici olarak kilitlenmelidir.
  it("should lock account after five failed login attempts", async () => {
    await createTestUser({
      email: activeEmail,
      isActive: true,
      emailVerifiedAt: new Date(),
    });

    for (let i = 0; i < 5; i += 1) {
      await request(app).post("/api/auth/login").send({
        email: activeEmail,
        password: "Wrong12345",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: activeEmail,
      },
    });

    expect(user.failedLoginAttempts).toBe(5);
    expect(user.lockedUntil).toBeTruthy();
  });
});
