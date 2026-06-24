import bcrypt from "bcryptjs";
import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/database/prisma.client.js";
import { generateAccessToken } from "../../src/utils/jwt.js";

const api = () => request(app);

const uniqueEmail = () => `auth-event-route-${Date.now()}-${Math.random()}@plastifay.com.tr`;

const createSuperAdminHeader = async () => {
  const role = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });

  if (!role) throw new Error("SUPER_ADMIN role seed edilmemiş.");

  const user = await prisma.user.create({
    data: {
      firstName: "Route",
      lastName: "ADMIN",
      email: uniqueEmail(),
      passwordHash: await bcrypt.hash("Test123*", 10),
      isActive: true,
      emailVerifiedAt: new Date(),
      roleId: role.id,
      tokenVersion: 0,
    },
  });

  return `Bearer ${generateAccessToken(user)}`;
};

beforeEach(async () => {
  await prisma.authEventLog.deleteMany({
    where: {
      email: {
        contains: "auth-event-route-",
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "auth-event-route-",
      },
    },
  });
});

describe("auth-event-log route coverage", () => {
  it("lists auth event logs for SUPER_ADMIN", async () => {
    const authHeader = await createSuperAdminHeader();

    await prisma.authEventLog.create({
      data: {
        email: uniqueEmail(),
        event: "LOGIN_SUCCESS",
        success: true,
        message: "coverage test",
      },
    });

    const res = await api().get("/api/auth-event-logs").set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("deletes auth event logs for SUPER_ADMIN", async () => {
    const authHeader = await createSuperAdminHeader();

    await prisma.authEventLog.create({
      data: {
        email: uniqueEmail(),
        event: "LOGIN_FAILED",
        success: false,
        message: "coverage delete test",
      },
    });

    const res = await api().delete("/api/auth-event-logs").set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
