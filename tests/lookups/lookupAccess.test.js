import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const email = "lookup-access-test@plastifay.com.tr";
const password = "Test12345";

const expectArrayResponse = (data) => {
  expect(Array.isArray(data.rows || data.items || data)).toBe(true);
};

const createUser = async () => {
  const role = await prisma.role.findUnique({
    where: {
      name: ROLES.ADMIN,
    },
  });

  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Lookup",
      lastName: "Test",
      email,
      passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      tokenVersion: 0,
      roleId: role.id,
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

  return { user, token };
};

describe("Lookup Access Tests", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email,
      },
    });
  });

  it("should allow authenticated user to get countries", async () => {
    const { token } = await createUser();

    const response = await request(app).get("/api/lookups/countries").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expectArrayResponse(response.body.data);
  });

  it("should reject countries endpoint without token", async () => {
    const response = await request(app).get("/api/lookups/countries");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should allow authenticated user to get cities", async () => {
    const { token } = await createUser();

    const response = await request(app).get("/api/lookups/cities").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expectArrayResponse(response.body.data);
  });

  it("should allow authenticated user to get districts", async () => {
    const { token } = await createUser();

    const response = await request(app).get("/api/lookups/districts").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expectArrayResponse(response.body.data);
  });

  it("should allow authenticated user to get tax offices", async () => {
    const { token } = await createUser();

    const response = await request(app).get("/api/lookups/tax-offices").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expectArrayResponse(response.body.data);
  });
});
