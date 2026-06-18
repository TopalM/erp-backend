import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const adminEmail = "employee-access-admin-test@plastifay.com.tr";
const viewerEmail = "employee-access-viewer-test@plastifay.com.tr";
const permissionUserEmail = "employee-access-permission-test@plastifay.com.tr";

const password = "Test12345";

// Belirtilen role sahip test kullanıcısı oluşturur.
// permissions verilirse kullanıcıya özel yetki ataması yapılır.
const createUserWithRole = async ({ email, roleName, permissions = [] }) => {
  const role = await prisma.role.findUnique({
    where: {
      name: roleName,
    },
  });

  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Employee",
      lastName: "Access Test",
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

  if (permissions.length > 0) {
    const permissionRows = await prisma.permission.findMany({
      where: {
        code: {
          in: permissions,
        },
      },
    });

    expect(permissionRows.length).toBe(permissions.length);

    await prisma.userPermission.createMany({
      data: permissionRows.map((permission) => ({
        userId: user.id,
        permissionId: permission.id,
        effect: "ALLOW",
      })),
    });
  }

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

describe("Employee Access Tests", () => {
  // Her testten önce employee erişim test kullanıcılarını ve özel yetkilerini temizler.
  beforeEach(async () => {
    const emails = [adminEmail, viewerEmail, permissionUserEmail];

    const users = await prisma.user.findMany({
      where: {
        email: {
          in: emails,
        },
      },
      select: {
        id: true,
      },
    });

    await prisma.userPermission.deleteMany({
      where: {
        userId: {
          in: users.map((user) => user.id),
        },
      },
    });

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

  // ADMIN rolü permission kontrolünü bypass ederek çalışan listesini görebilmelidir.
  it("should allow admin to list employees", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).get("/api/employees").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // employee.read yetkisi olan kullanıcı çalışan listesini görebilmelidir.
  it("should allow user with employee read permission to list employees", async () => {
    const { token } = await createUserWithRole({
      email: permissionUserEmail,
      roleName: ROLES.VIEWER,
      permissions: [PERMISSIONS.EMPLOYEE_READ],
    });

    const response = await request(app).get("/api/employees").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // Token olmadan çalışan listesi görüntülenememelidir.
  it("should reject employee list request without token", async () => {
    const response = await request(app).get("/api/employees");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // employee.read yetkisi olmayan VIEWER çalışan listesini görememelidir.
  it("should reject viewer from listing employees without permission", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).get("/api/employees").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
