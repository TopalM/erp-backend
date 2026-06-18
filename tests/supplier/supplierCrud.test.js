import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const adminEmail = "supplier-crud-admin-test@plastifay.com.tr";
const rawMaterialUserEmail = "supplier-crud-rm-test@plastifay.com.tr";
const viewerEmail = "supplier-crud-viewer-test@plastifay.com.tr";

const supplierEmail = "supplier-crud-test@plastifay.com.tr";
const updatedSupplierEmail = "supplier-crud-updated-test@plastifay.com.tr";
const password = "Test12345";

// Test kullanıcısı oluşturur.
// ADMIN rolü permission kontrolünü bypass eder.
// VIEWER rolüne istenirse özel permission atanır.
const createUser = async ({ email, roleName = ROLES.VIEWER, permissions = [] }) => {
  const role = await prisma.role.findUnique({
    where: {
      name: roleName,
    },
  });

  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Supplier",
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

// ADMIN rolüne sahip test kullanıcısı oluşturur.
const createAdminUser = async () => {
  return createUser({
    email: adminEmail,
    roleName: ROLES.ADMIN,
  });
};

// Hammadde satınalma yetkilerine sahip normal kullanıcı oluşturur.
const createRawMaterialPurchaseUser = async () => {
  return createUser({
    email: rawMaterialUserEmail,
    roleName: ROLES.VIEWER,
    permissions: [PERMISSIONS.SUPPLIER_CREATE, PERMISSIONS.SUPPLIER_UPDATE, PERMISSIONS.SUPPLIER_DELETE],
  });
};

// Supplier oluşturmak için gerekli lokasyon id bilgilerini seed verilerinden alır.
const getLocationPayload = async () => {
  const city = await prisma.city.findFirst({
    include: {
      districts: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  expect(city).toBeTruthy();

  return {
    countryId: city.countryId,
    cityId: city.id,
    districtId: city.districts?.[0]?.id || null,
  };
};

// Geçerli supplier payload'ı oluşturur.
const createSupplierPayload = async (overrides = {}) => {
  const locationPayload = await getLocationPayload();

  return {
    companyName: "Supplier CRUD Test Firma",
    phoneNumber: "0212 111 22 33",
    email: supplierEmail,
    taxOffice: "Test Vergi Dairesi",
    taxNumber: "1234567890",
    address: "Test adres",

    city: "Kocaeli",
    district: "Dilovası",

    supplierResponsiblePerson: "Test Yetkili",
    mobilePhoneNumber: "0532 111 22 33",
    contactEmail: supplierEmail,

    categoryType: "MATERIAL",

    ...locationPayload,
    ...overrides,
  };
};

describe("Supplier CRUD Tests", () => {
  // Her testten önce supplier CRUD test verilerini, kullanıcıları ve özel yetkileri temizler.
  beforeEach(async () => {
    const emails = [adminEmail, rawMaterialUserEmail, viewerEmail];

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

    await prisma.supplier.deleteMany({
      where: {
        OR: [{ email: supplierEmail }, { email: updatedSupplierEmail }, { name: { contains: "Supplier CRUD Test" } }],
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

  // ADMIN kullanıcısı yeni tedarikçi oluşturabilmelidir.
  it("should create supplier as admin", async () => {
    const { token } = await createAdminUser();
    const payload = await createSupplierPayload();

    const response = await request(app).post("/api/suppliers").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.companyName).toBe(payload.companyName);
    expect(response.body.data.email).toBe(payload.email);
  });

  // Hammadde satınalma create yetkisi olan kullanıcı tedarikçi oluşturabilmelidir.
  it("should create supplier with supplier create permission", async () => {
    const { token } = await createRawMaterialPurchaseUser();
    const payload = await createSupplierPayload();

    const response = await request(app).post("/api/suppliers").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
  });

  // Permission olmayan VIEWER tedarikçi oluşturamamalıdır.
  it("should reject viewer from creating supplier without permission", async () => {
    const { token } = await createUser({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const payload = await createSupplierPayload();

    const response = await request(app).post("/api/suppliers").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // Firma adı olmadan tedarikçi oluşturulamamalıdır.
  it("should reject supplier create validation error", async () => {
    const { token } = await createAdminUser();
    const payload = await createSupplierPayload({
      companyName: "",
    });

    const response = await request(app).post("/api/suppliers").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcısı mevcut tedarikçiyi güncelleyebilmelidir.
  it("should update supplier as admin", async () => {
    const { token } = await createAdminUser();
    const createPayload = await createSupplierPayload();

    const createResponse = await request(app).post("/api/suppliers").set("Authorization", `Bearer ${token}`).send(createPayload);

    const supplierId = createResponse.body.data.id;

    const updatePayload = await createSupplierPayload({
      companyName: "Supplier CRUD Test Firma Updated",
      email: updatedSupplierEmail,
      phoneNumber: "0212 999 88 77",
    });

    const updateResponse = await request(app).patch(`/api/suppliers/${supplierId}`).set("Authorization", `Bearer ${token}`).send(updatePayload);

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.companyName).toBe(updatePayload.companyName);
    expect(updateResponse.body.data.email).toBe(updatedSupplierEmail);
  });

  // Hammadde satınalma update yetkisi olan kullanıcı tedarikçiyi güncelleyebilmelidir.
  it("should update supplier with supplier update permission", async () => {
    const admin = await createAdminUser();
    const rawMaterialUser = await createRawMaterialPurchaseUser();

    const createPayload = await createSupplierPayload();

    const createResponse = await request(app).post("/api/suppliers").set("Authorization", `Bearer ${admin.token}`).send(createPayload);

    const supplierId = createResponse.body.data.id;

    const updatePayload = await createSupplierPayload({
      companyName: "Supplier CRUD Test Firma Updated",
      email: updatedSupplierEmail,
    });

    const updateResponse = await request(app)
      .patch(`/api/suppliers/${supplierId}`)
      .set("Authorization", `Bearer ${rawMaterialUser.token}`)
      .send(updatePayload);

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.success).toBe(true);
  });

  // Olmayan tedarikçi güncellenememelidir.
  it("should reject update for unknown supplier", async () => {
    const { token } = await createAdminUser();
    const payload = await createSupplierPayload();

    const response = await request(app).patch("/api/suppliers/unknown-supplier-id").set("Authorization", `Bearer ${token}`).send(payload);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ADMIN kullanıcısı tedarikçiyi soft delete ile silebilmelidir.
  it("should delete supplier as admin", async () => {
    const { token } = await createAdminUser();
    const payload = await createSupplierPayload();

    const createResponse = await request(app).post("/api/suppliers").set("Authorization", `Bearer ${token}`).send(payload);

    const supplierId = createResponse.body.data.id;

    const deleteResponse = await request(app).delete(`/api/suppliers/${supplierId}`).set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    const deletedSupplier = await prisma.supplier.findUnique({
      where: {
        id: supplierId,
      },
    });

    expect(deletedSupplier.deletedAt).toBeTruthy();
  });

  // Hammadde satınalma delete yetkisi olan kullanıcı tedarikçiyi silebilmelidir.
  it("should delete supplier with supplier delete permission", async () => {
    const admin = await createAdminUser();
    const rawMaterialUser = await createRawMaterialPurchaseUser();

    const payload = await createSupplierPayload();

    const createResponse = await request(app).post("/api/suppliers").set("Authorization", `Bearer ${admin.token}`).send(payload);

    const supplierId = createResponse.body.data.id;

    const deleteResponse = await request(app).delete(`/api/suppliers/${supplierId}`).set("Authorization", `Bearer ${rawMaterialUser.token}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
  });

  // Olmayan tedarikçi silinememelidir.
  it("should reject delete for unknown supplier", async () => {
    const { token } = await createAdminUser();

    const response = await request(app).delete("/api/suppliers/unknown-supplier-id").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
