import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/database/prisma.client.js";

const registerEmail = process.env.TEST_AUTH_EMAIL;
const duplicateEmail = "register-duplicate-test@plastifay.com.tr";
const passwordRuleEmail = "password-rule-test@plastifay.com.tr";

describe("Auth Register Tests", () => {
  // Her testten önce register test kullanıcılarını temizler.
  beforeEach(async () => {
    await prisma.authEventLog.deleteMany({
      where: {
        email: {
          in: [registerEmail, duplicateEmail, passwordRuleEmail],
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [registerEmail, duplicateEmail, passwordRuleEmail],
        },
      },
    });
  });

  // Gerçek mail adresi ile kullanıcı kaydı oluşturulabilmelidir.
  // Bu test gerçek SMTP üzerinden email doğrulama maili gönderir.
  it("should register a new user successfully and send verification email", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: registerEmail,
      password: "Test12345!",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(registerEmail);

    // Hassas bilgiler response içerisinde bulunmamalıdır.
    expect(response.body.data.passwordHash).toBeUndefined();
  });

  // Plastifay dışındaki email adresleri ile kayıt oluşturulamamalıdır.
  it("should reject non plastifay email addresses", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: "test@gmail.com",
      password: "Test12345!",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Aynı email adresi ikinci kez kayıt edilememelidir.
  it("should reject duplicate email addresses", async () => {
    const firstResponse = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: duplicateEmail,
      password: "Test12345!",
    });

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: duplicateEmail,
      password: "Test12345!",
    });

    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.body.success).toBe(false);
  });

  // Özel karakter içermeyen şifre reddedilmelidir.
  it("should reject password without special character", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: passwordRuleEmail,
      password: "Test12345",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
