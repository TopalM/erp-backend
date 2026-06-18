import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";

const testEmail = "me-test@plastifay.com.tr";
const password = "Test12345";

// Me endpoint testi için aktif ve doğrulanmış kullanıcı oluşturur.
const createMeUser = async () => {
  const viewerRole = await prisma.role.findUnique({
    where: {
      name: "VIEWER",
    },
  });

  expect(viewerRole).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Me",
      lastName: "Test",
      email: testEmail,
      passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      tokenVersion: 0,
      roleId: viewerRole.id,
    },
    include: {
      role: true,
      department: true,
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

describe("Auth Me Tests", () => {
  // Her testten önce me test kullanıcısını temizler.
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

  // Geçerli token ile oturum açmış kullanıcı bilgileri dönebilmelidir.
  it("should return authenticated user", async () => {
    const { token } = await createMeUser();

    const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(testEmail);

    expect(response.body.data.role).toBeTruthy();
    expect(response.body.data.userPermissions).toBeDefined();
    expect(response.body.data.employee).toBeDefined();

    expect(response.body.data.passwordHash).toBeUndefined();
  });

  // Token olmadan kullanıcı bilgisi alınamamalıdır.
  it("should reject request without token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // Geçersiz token ile kullanıcı bilgisi alınamamalıdır.
  it("should reject invalid token", async () => {
    const response = await request(app).get("/api/auth/me").set("Authorization", "Bearer invalid-token");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
