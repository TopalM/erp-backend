import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const adminEmail = "role-crud-admin-test@plastifay.com.tr";
const viewerEmail = "role-crud-viewer-test@plastifay.com.tr";
const password = "Test12345";

const createPayload = () => ({
  name: "TEST_ROLE",
});

const updatePayload = () => ({
  name: "UPDATED_TEST_ROLE",
});

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
      firstName: "Role",
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

describe("Role CRUD Tests", () => {
  beforeEach(async () => {
    const emails = [adminEmail, viewerEmail];

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

    await prisma.role.deleteMany({
      where: {
        name: {
          in: ["TEST_ROLE", "UPDATED_TEST_ROLE", "DUPLICATE_TEST_ROLE"],
        },
      },
    });
  });

  // ADMIN kullanıcı rol oluşturabilmelidir.
  it("should create role", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const payload = createPayload();

    const response = await request(app).post("/api/roles").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(payload.name);

    const role = await prisma.role.findUnique({
      where: {
        name: payload.name,
      },
    });

    expect(role).toBeTruthy();
  });

  // Token olmadan rol oluşturulamamalıdır.
  it("should reject create role without token", async () => {
    const response = await request(app).post("/api/roles").send(createPayload());

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // VIEWER kullanıcı rol oluşturamamalıdır.
  it("should reject viewer from creating role", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).post("/api/roles").set("Authorization", `Bearer ${token}`).send(createPayload());

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // Eksik rol adı ile rol oluşturulamamalıdır.
  it("should reject create role validation error", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).post("/api/roles").set("Authorization", `Bearer ${token}`).send({
      name: "",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Aynı rol adı ile ikinci kayıt oluşturulamamalıdır.
  it("should reject duplicate role name", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const payload = {
      name: "DUPLICATE_TEST_ROLE",
    };

    const firstResponse = await request(app).post("/api/roles").set("Authorization", `Bearer ${token}`).send(payload);

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app).post("/api/roles").set("Authorization", `Bearer ${token}`).send(payload);

    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.body.success).toBe(false);
  });

  // ADMIN kullanıcı rol detayını görüntüleyebilmelidir.
  it("should get role by id", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const role = await prisma.role.create({
      data: createPayload(),
    });

    const response = await request(app).get(`/api/roles/${role.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(role.id);
  });

  // Olmayan rol detayı 404 dönmelidir.
  it("should reject get role by unknown id", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).get("/api/roles/unknown-role-id").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı rolü güncelleyebilmelidir.
  it("should update role", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const role = await prisma.role.create({
      data: createPayload(),
    });

    const payload = updatePayload();

    const response = await request(app).patch(`/api/roles/${role.id}`).set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(payload.name);

    const updatedRole = await prisma.role.findUnique({
      where: {
        id: role.id,
      },
    });

    expect(updatedRole.name).toBe(payload.name);
  });

  // Olmayan rol güncelleme 404 dönmelidir.
  it("should reject update for unknown role", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).patch("/api/roles/unknown-role-id").set("Authorization", `Bearer ${token}`).send(updatePayload());

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // Sistem rolü güncellenememelidir.
  it("should reject update system role", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const adminRole = await prisma.role.findUnique({
      where: {
        name: ROLES.ADMIN,
      },
    });

    const response = await request(app).patch(`/api/roles/${adminRole.id}`).set("Authorization", `Bearer ${token}`).send({
      name: "CHANGED_ADMIN",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı özel rolü silebilmelidir.
  it("should delete role", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const role = await prisma.role.create({
      data: createPayload(),
    });

    const response = await request(app).delete(`/api/roles/${role.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const deletedRole = await prisma.role.findUnique({
      where: {
        id: role.id,
      },
    });

    expect(deletedRole).toBeNull();
  });

  // Olmayan rol silme 404 dönmelidir.
  it("should reject delete for unknown role", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).delete("/api/roles/unknown-role-id").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // Sistem rolü silinememelidir.
  it("should reject delete system role", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const viewerRole = await prisma.role.findUnique({
      where: {
        name: ROLES.VIEWER,
      },
    });

    const response = await request(app).delete(`/api/roles/${viewerRole.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
