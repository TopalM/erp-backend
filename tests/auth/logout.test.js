import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import app from "../../src/app.js";

const testEmail = "logout-test@plastifay.com.tr";
const password = "Test12345";

// Logout test kullanıcısı oluşturur.
const createLogoutUser = async () => {
  const viewerRole = await prisma.role.findUnique({
    where: {
      name: "VIEWER",
    },
  });

  expect(viewerRole).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Logout",
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

describe("Auth Logout Tests", () => {
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

  // Logout sonrası tokenVersion artırılmalıdır.
  it("should logout successfully", async () => {
    const { token } = await createLogoutUser();

    const response = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const user = await prisma.user.findUnique({
      where: {
        email: testEmail,
      },
    });

    expect(user.tokenVersion).toBe(1);
  });

  // JWT olmadan logout yapılamamalıdır.
  it("should reject logout without token", async () => {
    const response = await request(app).post("/api/auth/logout");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // Logout sonrası eski token geçersiz olmalıdır.
  it("should invalidate old token after logout", async () => {
    const { token } = await createLogoutUser();

    await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${token}`);

    const meResponse = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(meResponse.statusCode).toBe(401);
  });
});
