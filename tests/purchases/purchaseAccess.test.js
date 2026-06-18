import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const adminEmail = "purchase-access-admin-test@plastifay.com.tr";
const viewerEmail = "purchase-access-viewer-test@plastifay.com.tr";
const password = "Test12345";

const createUser = async ({ email, roleName }) => {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Purchase",
      lastName: "Access Test",
      email,
      passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      tokenVersion: 0,
      roleId: role.id,
    },
    include: { role: true },
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
    { expiresIn: env.jwt.expiresIn },
  );

  return { user, token };
};

describe("Purchase Access Tests", () => {
  beforeEach(async () => {
    const emails = [adminEmail, viewerEmail];

    await prisma.authEventLog.deleteMany({ where: { email: { in: emails } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
  });

  it("should allow admin to list purchases", async () => {
    const { token } = await createUser({ email: adminEmail, roleName: ROLES.ADMIN });

    const response = await request(app).get("/api/purchases").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("should reject viewer from listing purchases", async () => {
    const { token } = await createUser({ email: viewerEmail, roleName: ROLES.VIEWER });

    const response = await request(app).get("/api/purchases").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should reject purchase list without token", async () => {
    const response = await request(app).get("/api/purchases");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
