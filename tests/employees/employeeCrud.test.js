import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const adminEmail = "employee-crud-admin-test@plastifay.com.tr";
const permissionUserEmail = "employee-crud-permission-test@plastifay.com.tr";
const viewerEmail = "employee-crud-viewer-test@plastifay.com.tr";

const employeeCode = "EMP-CRUD-001";
const updatedEmployeeCode = "EMP-CRUD-002";

const password = "Test12345";

// Belirtilen role ve özel permission bilgileriyle test kullanıcısı oluşturur.
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

// ADMIN test kullanıcısı oluşturur.
const createAdminUser = async () => {
  return createUserWithRole({
    email: adminEmail,
    roleName: ROLES.ADMIN,
  });
};

// Employee CRUD yetkilerine sahip normal test kullanıcısı oluşturur.
const createEmployeePermissionUser = async () => {
  return createUserWithRole({
    email: permissionUserEmail,
    roleName: ROLES.VIEWER,
    permissions: [PERMISSIONS.EMPLOYEE_READ, PERMISSIONS.EMPLOYEE_CREATE, PERMISSIONS.EMPLOYEE_UPDATE, PERMISSIONS.EMPLOYEE_DELETE],
  });
};

// Geçerli çalışan payload'ı oluşturur.
const createEmployeePayload = (overrides = {}) => {
  return {
    employeeCode,
    firstName: "Ahmet",
    lastName: "Çalışkan",
    type: "BLUE_COLLAR",
    status: "ACTIVE",
    phone: "0532 111 22 33",
    email: "employee-crud-test@plastifay.com.tr",
    identityNumber: "11111111110",
    title: "Bakım Personeli",
    monthlySalary: 35000,
    salaryCurrency: "TRY",
    note: "Test çalışan kaydı",
    ...overrides,
  };
};

describe("Employee CRUD Tests", () => {
  // Her testten önce employee CRUD test verilerini, kullanıcıları ve özel yetkileri temizler.
  beforeEach(async () => {
    const emails = [adminEmail, permissionUserEmail, viewerEmail];

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

    await prisma.employee.deleteMany({
      where: {
        OR: [
          {
            employeeCode: {
              in: [employeeCode, updatedEmployeeCode],
            },
          },
          {
            email: {
              in: ["employee-crud-test@plastifay.com.tr", "employee-crud-updated-test@plastifay.com.tr"],
            },
          },
        ],
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

  // ADMIN kullanıcı yeni çalışan oluşturabilmelidir.
  it("should create employee as admin", async () => {
    const { token } = await createAdminUser();
    const payload = createEmployeePayload();

    const response = await request(app).post("/api/employees").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.employeeCode).toBe(payload.employeeCode);
    expect(response.body.data.firstName).toBe(payload.firstName);
  });

  // employee.create yetkisi olan kullanıcı çalışan oluşturabilmelidir.
  it("should create employee with employee create permission", async () => {
    const { token } = await createEmployeePermissionUser();
    const payload = createEmployeePayload();

    const response = await request(app).post("/api/employees").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
  });

  // Permission olmayan VIEWER çalışan oluşturamamalıdır.
  it("should reject viewer from creating employee without permission", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const payload = createEmployeePayload();

    const response = await request(app).post("/api/employees").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // Zorunlu alanlar eksik olduğunda validation hatası dönmelidir.
  it("should reject employee create validation error", async () => {
    const { token } = await createAdminUser();

    const payload = createEmployeePayload({
      employeeCode: "",
      firstName: "",
      lastName: "",
    });

    const response = await request(app).post("/api/employees").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Aynı employeeCode ile ikinci çalışan oluşturulamamalıdır.
  it("should reject duplicate employee code", async () => {
    const { token } = await createAdminUser();
    const payload = createEmployeePayload();

    await request(app).post("/api/employees").set("Authorization", `Bearer ${token}`).send(payload);

    const response = await request(app).post("/api/employees").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı çalışan detayını görüntüleyebilmelidir.
  it("should get employee by id", async () => {
    const { token } = await createAdminUser();

    const createResponse = await request(app).post("/api/employees").set("Authorization", `Bearer ${token}`).send(createEmployeePayload());

    const employeeId = createResponse.body.data.id;

    const response = await request(app).get(`/api/employees/${employeeId}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(employeeId);
  });

  // Olmayan çalışan detayı 404 dönmelidir.
  it("should reject get employee by unknown id", async () => {
    const { token } = await createAdminUser();

    const response = await request(app).get("/api/employees/unknown-employee-id").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı çalışan bilgisini güncelleyebilmelidir.
  it("should update employee as admin", async () => {
    const { token } = await createAdminUser();

    const createResponse = await request(app).post("/api/employees").set("Authorization", `Bearer ${token}`).send(createEmployeePayload());

    const employeeId = createResponse.body.data.id;

    const updatePayload = createEmployeePayload({
      employeeCode: updatedEmployeeCode,
      firstName: "Mehmet",
      lastName: "Güncel",
      email: "employee-crud-updated-test@plastifay.com.tr",
      monthlySalary: 40000,
    });

    const response = await request(app).patch(`/api/employees/${employeeId}`).set("Authorization", `Bearer ${token}`).send(updatePayload);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.employeeCode).toBe(updatedEmployeeCode);
    expect(response.body.data.firstName).toBe(updatePayload.firstName);
  });

  // employee.update yetkisi olan kullanıcı çalışan güncelleyebilmelidir.
  it("should update employee with employee update permission", async () => {
    const admin = await createAdminUser();
    const permissionUser = await createEmployeePermissionUser();

    const createResponse = await request(app).post("/api/employees").set("Authorization", `Bearer ${admin.token}`).send(createEmployeePayload());

    const employeeId = createResponse.body.data.id;

    const response = await request(app).patch(`/api/employees/${employeeId}`).set("Authorization", `Bearer ${permissionUser.token}`).send({
      firstName: "Yetkili",
      lastName: "Güncelleme",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // Olmayan çalışan güncellenememelidir.
  it("should reject update for unknown employee", async () => {
    const { token } = await createAdminUser();

    const response = await request(app).patch("/api/employees/unknown-employee-id").set("Authorization", `Bearer ${token}`).send({
      firstName: "Unknown",
    });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı çalışanı silebilmelidir.
  it("should delete employee as admin", async () => {
    const { token } = await createAdminUser();

    const createResponse = await request(app).post("/api/employees").set("Authorization", `Bearer ${token}`).send(createEmployeePayload());

    const employeeId = createResponse.body.data.id;

    const response = await request(app).delete(`/api/employees/${employeeId}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // employee.delete yetkisi olan kullanıcı çalışan silebilmelidir.
  it("should delete employee with employee delete permission", async () => {
    const admin = await createAdminUser();
    const permissionUser = await createEmployeePermissionUser();

    const createResponse = await request(app).post("/api/employees").set("Authorization", `Bearer ${admin.token}`).send(createEmployeePayload());

    const employeeId = createResponse.body.data.id;

    const response = await request(app).delete(`/api/employees/${employeeId}`).set("Authorization", `Bearer ${permissionUser.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // Olmayan çalışan silinememelidir.
  it("should reject delete for unknown employee", async () => {
    const { token } = await createAdminUser();

    const response = await request(app).delete("/api/employees/unknown-employee-id").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı çalışan durumunu güncelleyebilmelidir.
  // Bu test ACTIVE olan bir çalışanı PASSIVE durumuna alır.
  it("should update employee status", async () => {
    const { token } = await createAdminUser();

    const createResponse = await request(app).post("/api/employees").set("Authorization", `Bearer ${token}`).send(createEmployeePayload());

    const employeeId = createResponse.body.data.id;

    const response = await request(app).patch(`/api/employees/${employeeId}/status`).set("Authorization", `Bearer ${token}`).send({
      status: "PASSIVE",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("PASSIVE");
  });

  // Olmayan çalışan için durum güncelleme isteği 404 dönmelidir.
  it("should reject status update for unknown employee", async () => {
    const { token } = await createAdminUser();

    const response = await request(app).patch("/api/employees/unknown-employee-id/status").set("Authorization", `Bearer ${token}`).send({
      status: "PASSIVE",
    });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı bir çalışan kaydını mevcut bir kullanıcı hesabına bağlayabilmelidir.
  // Bu işlem beyaz yaka/ofis çalışanı gibi sisteme giriş yapacak personeller için kullanılır.
  it("should link employee to user", async () => {
    const admin = await createAdminUser();

    const employeeResponse = await request(app).post("/api/employees").set("Authorization", `Bearer ${admin.token}`).send(createEmployeePayload());

    const employeeId = employeeResponse.body.data.id;

    const linkedUser = await prisma.user.create({
      data: {
        firstName: "Linked",
        lastName: "User",
        email: "employee-link-test@plastifay.com.tr",
        passwordHash: await bcrypt.hash(password, 10),
        isActive: true,
        emailVerifiedAt: new Date(),
        roleId: admin.user.roleId,
      },
    });

    const response = await request(app).patch(`/api/employees/${employeeId}/link-user`).set("Authorization", `Bearer ${admin.token}`).send({
      userId: linkedUser.id,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.userId).toBe(linkedUser.id);

    await prisma.user.delete({
      where: {
        id: linkedUser.id,
      },
    });
  });

  // Olmayan çalışan için kullanıcı bağlama isteği 404 dönmelidir.
  it("should reject link user for unknown employee", async () => {
    const admin = await createAdminUser();

    const response = await request(app).patch("/api/employees/unknown-employee-id/link-user").set("Authorization", `Bearer ${admin.token}`).send({
      userId: "unknown-user-id",
    });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcı çalışan ile bağlı kullanıcı hesabı arasındaki ilişkiyi kaldırabilmelidir.
  // Bu işlem çalışan kaydı kalırken sistem kullanıcı hesabı bağlantısını koparır.
  it("should unlink employee user", async () => {
    const admin = await createAdminUser();

    const employeeResponse = await request(app).post("/api/employees").set("Authorization", `Bearer ${admin.token}`).send(createEmployeePayload());

    const employeeId = employeeResponse.body.data.id;

    const linkedUser = await prisma.user.create({
      data: {
        firstName: "Linked",
        lastName: "User",
        email: "employee-unlink-test@plastifay.com.tr",
        passwordHash: await bcrypt.hash(password, 10),
        isActive: true,
        emailVerifiedAt: new Date(),
        roleId: admin.user.roleId,
      },
    });

    await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        userId: linkedUser.id,
      },
    });

    const response = await request(app).patch(`/api/employees/${employeeId}/unlink-user`).set("Authorization", `Bearer ${admin.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.userId).toBeNull();

    await prisma.user.delete({
      where: {
        id: linkedUser.id,
      },
    });
  });
});
