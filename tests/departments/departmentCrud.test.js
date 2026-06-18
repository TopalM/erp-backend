import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const adminEmail = "department-crud-admin-test@plastifay.com.tr";
const viewerEmail = "department-crud-viewer-test@plastifay.com.tr";
const password = "Test12345";

const createPayload = () => ({
  name: "Test Departmanı",
  code: "TEST_DEPARTMENT",
});

const updatePayload = () => ({
  name: "Güncel Test Departmanı",
  code: "UPDATED_TEST_DEPARTMENT",
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
      firstName: "Department",
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

describe("Department CRUD Tests", () => {
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

    await prisma.department.deleteMany({
      where: {
        code: {
          in: ["TEST_DEPARTMENT", "UPDATED_TEST_DEPARTMENT", "DUPLICATE_TEST_DEPARTMENT"],
        },
      },
    });
  });

  // ADMIN kullanıcı departman oluşturabilmelidir.
  it("should create department", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const payload = createPayload();

    const response = await request(app).post("/api/departments").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(payload.name);
    expect(response.body.data.code).toBe(payload.code);

    const department = await prisma.department.findUnique({
      where: {
        code: payload.code,
      },
    });

    expect(department).toBeTruthy();
  });

  // Token olmadan departman oluşturulamamalıdır.
  it("should reject create department without token", async () => {
    const response = await request(app).post("/api/departments").send(createPayload());

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // VIEWER kullanıcı departman oluşturamamalıdır.
  it("should reject viewer from creating department", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app).post("/api/departments").set("Authorization", `Bearer ${token}`).send(createPayload());

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // Eksik veya geçersiz veri ile departman oluşturulamamalıdır.
  it("should reject create department validation error", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).post("/api/departments").set("Authorization", `Bearer ${token}`).send({
      name: "",
      code: "",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Aynı departman kodu ile ikinci kayıt oluşturulamamalıdır.
  it("should reject duplicate department code", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const payload = {
      name: "Duplicate Department",
      code: "DUPLICATE_TEST_DEPARTMENT",
    };

    const firstResponse = await request(app).post("/api/departments").set("Authorization", `Bearer ${token}`).send(payload);

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app).post("/api/departments").set("Authorization", `Bearer ${token}`).send(payload);

    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.body.success).toBe(false);
  });

  // ADMIN kullanıcı departman detayını görüntüleyebilmelidir.
  it("should get department by id", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const department = await prisma.department.create({
      data: createPayload(),
    });

    const response = await request(app).get(`/api/departments/${department.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(department.id);
  });

  // Olmayan departman detayı 404 dönmelidir.
  it("should reject get department by unknown id", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).get("/api/departments/unknown-department-id").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı departmanı güncelleyebilmelidir.
  it("should update department", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const department = await prisma.department.create({
      data: createPayload(),
    });

    const payload = updatePayload();

    const response = await request(app).patch(`/api/departments/${department.id}`).set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(payload.name);
    expect(response.body.data.code).toBe(payload.code);

    const updatedDepartment = await prisma.department.findUnique({
      where: {
        id: department.id,
      },
    });

    expect(updatedDepartment.name).toBe(payload.name);
    expect(updatedDepartment.code).toBe(payload.code);
  });

  // Olmayan departman güncelleme 404 dönmelidir.
  it("should reject update for unknown department", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).patch("/api/departments/unknown-department-id").set("Authorization", `Bearer ${token}`).send(updatePayload());

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı departmanı silebilmelidir.
  it("should delete department", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const department = await prisma.department.create({
      data: createPayload(),
    });

    const response = await request(app).delete(`/api/departments/${department.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const deletedDepartment = await prisma.department.findUnique({
      where: {
        id: department.id,
      },
    });

    expect(deletedDepartment).toBeNull();
  });

  // Olmayan departman silme 404 dönmelidir.
  it("should reject delete for unknown department", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app).delete("/api/departments/unknown-department-id").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
