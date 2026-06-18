import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const adminEmail = "permission-crud-admin-test@plastifay.com.tr";
const viewerEmail = "permission-crud-viewer-test@plastifay.com.tr";
const targetEmail = "permission-crud-target-test@plastifay.com.tr";

const password = "Test12345";

const permissionCode = "test.permission.crud";
const updatedPermissionCode = "test.permission.crud.updated";

// Belirtilen role sahip test kullanıcısı oluşturur.
const createUserWithRole = async ({ email, roleName }) => {
  const role = await prisma.role.findUnique({
    where: {
      name: roleName,
    },
  });

  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Permission",
      lastName: "Crud Test",
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

  return {
    user,
    token,
  };
};

// Geçerli permission payload'ı oluşturur.
const createPermissionPayload = (overrides = {}) => {
  return {
    code: permissionCode,
    name: "Test Permission CRUD",
    description: "Permission CRUD test açıklaması",
    ...overrides,
  };
};

describe("Permission CRUD Tests", () => {
  // Her testten önce permission CRUD test verilerini temizler.
  beforeEach(async () => {
    const emails = [adminEmail, viewerEmail, targetEmail];

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

    const permissions = await prisma.permission.findMany({
      where: {
        code: {
          in: [permissionCode, updatedPermissionCode],
        },
      },
      select: {
        id: true,
      },
    });

    await prisma.userPermission.deleteMany({
      where: {
        permissionId: {
          in: permissions.map((permission) => permission.id),
        },
      },
    });

    await prisma.permission.deleteMany({
      where: {
        code: {
          in: [permissionCode, updatedPermissionCode],
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

  // ADMIN kullanıcı yeni yetki oluşturabilmelidir.
  it("should create permission", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const payload = createPermissionPayload();

    const response = await request(app).post("/api/permissions").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.code).toBe(payload.code);
    expect(response.body.data.name).toBe(payload.name);
  });

  // Token olmadan yetki oluşturulamamalıdır.
  it("should reject create permission without token", async () => {
    const payload = createPermissionPayload();

    const response = await request(app).post("/api/permissions").send(payload);

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // VIEWER kullanıcı yetki oluşturamamalıdır.
  it("should reject viewer from creating permission", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const payload = createPermissionPayload();

    const response = await request(app).post("/api/permissions").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // Kod veya isim boşsa validation hatası dönmelidir.
  it("should reject create permission validation error", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const payload = createPermissionPayload({
      code: "",
      name: "",
    });

    const response = await request(app).post("/api/permissions").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Aynı code ile ikinci permission oluşturulamamalıdır.
  it("should reject duplicate permission code", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const payload = createPermissionPayload();

    await request(app).post("/api/permissions").set("Authorization", `Bearer ${token}`).send(payload);

    const response = await request(app).post("/api/permissions").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı tek permission detayını görüntüleyebilmelidir.
  it("should get permission by id", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const created = await prisma.permission.create({
      data: createPermissionPayload(),
    });

    const response = await request(app).get(`/api/permissions/${created.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(created.id);
    expect(response.body.data.code).toBe(permissionCode);
  });

  // Olmayan permission detayı 404 dönmelidir.
  it("should reject get permission by unknown id", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).get("/api/permissions/unknown-permission-id").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı permission bilgisini güncelleyebilmelidir.
  it("should update permission", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const created = await prisma.permission.create({
      data: createPermissionPayload(),
    });

    const payload = {
      code: updatedPermissionCode,
      name: "Updated Permission CRUD",
      description: "Güncellenmiş permission açıklaması",
    };

    const response = await request(app).patch(`/api/permissions/${created.id}`).set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.code).toBe(updatedPermissionCode);
    expect(response.body.data.name).toBe(payload.name);
  });

  // Olmayan permission güncellenememelidir.
  it("should reject update for unknown permission", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).patch("/api/permissions/unknown-permission-id").set("Authorization", `Bearer ${token}`).send({
      name: "Unknown Permission Update",
    });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı permission silebilmelidir.
  it("should delete permission", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const created = await prisma.permission.create({
      data: createPermissionPayload(),
    });

    const response = await request(app).delete(`/api/permissions/${created.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const deletedPermission = await prisma.permission.findUnique({
      where: {
        id: created.id,
      },
    });

    expect(deletedPermission).toBeNull();
  });

  // Kullanıcıya atanmış permission silinmemelidir.
  it("should reject delete assigned permission", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const { user: targetUser } = await createUserWithRole({
      email: targetEmail,
      roleName: ROLES.VIEWER,
    });

    const permission = await prisma.permission.create({
      data: createPermissionPayload(),
    });

    await prisma.userPermission.create({
      data: {
        userId: targetUser.id,
        permissionId: permission.id,
        effect: "ALLOW",
      },
    });

    const response = await request(app).delete(`/api/permissions/${permission.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Olmayan permission silinememelidir.
  it("should reject delete for unknown permission", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).delete("/api/permissions/unknown-permission-id").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
