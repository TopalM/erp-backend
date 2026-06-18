import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const profileEmail = "profile-test@plastifay.com.tr";
const password = "Test12345";

const createProfileUser = async () => {
  const role = await prisma.role.findUnique({
    where: {
      name: ROLES.VIEWER,
    },
  });

  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Profile",
      lastName: "Test",
      email: profileEmail,
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

  return {
    user,
    token,
  };
};

describe("User Profile Tests", () => {
  beforeEach(async () => {
    await prisma.authEventLog.deleteMany({
      where: {
        email: profileEmail,
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: profileEmail,
      },
    });
  });

  afterEach(async () => {
    await prisma.authEventLog.deleteMany({
      where: {
        email: profileEmail,
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: profileEmail,
      },
    });
  });

  // Kullanıcı kendi profil bilgilerini güncelleyebilmelidir.
  it("should update profile successfully", async () => {
    const { token } = await createProfileUser();

    const response = await request(app).patch("/api/users/profile").set("Authorization", `Bearer ${token}`).send({
      firstName: "Mustafa",
      lastName: "Topal",
      phone: "05551234567",
      preferredTheme: "dark",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data.firstName).toBe("Mustafa");
    expect(response.body.data.lastName).toBe("TOPAL");
    expect(response.body.data.phone).toBe("05551234567");
    expect(response.body.data.preferredTheme).toBe("dark");

    expect(response.body.data.passwordHash).toBeUndefined();
  });

  // Token olmadan profil güncellenememelidir.
  it("should reject profile update without token", async () => {
    const response = await request(app).patch("/api/users/profile").send({
      firstName: "Mustafa",
      lastName: "Topal",
      phone: "05551234567",
      preferredTheme: "dark",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // Geçersiz profil verisi 400 dönmelidir.
  it("should reject invalid profile payload", async () => {
    const { token } = await createProfileUser();

    const response = await request(app).patch("/api/users/profile").set("Authorization", `Bearer ${token}`).send({
      firstName: "",
      lastName: "",
      preferredTheme: "blue",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
