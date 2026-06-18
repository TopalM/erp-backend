import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const adminEmail = "purchase-crud-admin-test@plastifay.com.tr";
const viewerEmail = "purchase-crud-viewer-test@plastifay.com.tr";
const supplierEmail = "purchase-crud-supplier-test@plastifay.com.tr";
const password = "Test12345";

const createUser = async ({ email, roleName = ROLES.VIEWER }) => {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Purchase",
      lastName: "Crud Test",
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

const createSupplier = async (createdById) => {
  return prisma.supplier.create({
    data: {
      name: "Purchase CRUD Supplier",
      phone: "+902121112233",
      email: supplierEmail,
      address: "Test adres",
      contactName: "Test Yetkili",
      contactPhone: "+905321112233",
      contactEmail: supplierEmail,
      createdById,
      categories: {
        create: [{ type: "MATERIAL" }],
      },
    },
  });
};

const createPurchasePayload = (supplierId, overrides = {}) => ({
  supplierId,
  orderNo: `PO-TEST-${Date.now()}`,
  orderDate: new Date().toISOString(),
  orderType: "DOMESTIC",
  items: [
    {
      category: "MATERIAL",
      materialName: "Test Malzeme",
      quantity: 10,
      unitPrice: 25,
      totalWithoutTax: 250,
      taxAmount: 50,
      totalWithTax: 300,
    },
  ],
  totalWithoutTax: 250,
  totalTax: 50,
  totalWithTax: 300,
  ...overrides,
});

describe("Purchase CRUD Tests", () => {
  beforeEach(async () => {
    const emails = [adminEmail, viewerEmail];

    await prisma.purchaseOrderItem.deleteMany({
      where: {
        purchaseOrder: {
          orderNo: {
            startsWith: "PO-TEST-",
          },
        },
      },
    });

    await prisma.purchaseOrder.deleteMany({
      where: {
        orderNo: {
          startsWith: "PO-TEST-",
        },
      },
    });

    await prisma.supplier.deleteMany({
      where: {
        email: supplierEmail,
      },
    });

    await prisma.authEventLog.deleteMany({ where: { email: { in: emails } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
  });

  it("should create purchase as admin", async () => {
    const { user, token } = await createUser({ email: adminEmail, roleName: ROLES.ADMIN });
    const supplier = await createSupplier(user.id);

    const response = await request(app).post("/api/purchases").set("Authorization", `Bearer ${token}`).send(createPurchasePayload(supplier.id));

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.supplierId).toBe(supplier.id);
    expect(response.body.data.items.length).toBe(1);
  });

  it("should reject purchase create without token", async () => {
    const response = await request(app).post("/api/purchases").send({});

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should reject viewer from creating purchase", async () => {
    const admin = await createUser({ email: adminEmail, roleName: ROLES.ADMIN });
    const supplier = await createSupplier(admin.user.id);

    const { token } = await createUser({ email: viewerEmail, roleName: ROLES.VIEWER });

    const response = await request(app).post("/api/purchases").set("Authorization", `Bearer ${token}`).send(createPurchasePayload(supplier.id));

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should reject invalid purchase payload", async () => {
    const { token } = await createUser({ email: adminEmail, roleName: ROLES.ADMIN });

    const response = await request(app).post("/api/purchases").set("Authorization", `Bearer ${token}`).send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should list purchases", async () => {
    const { user, token } = await createUser({ email: adminEmail, roleName: ROLES.ADMIN });
    const supplier = await createSupplier(user.id);

    await request(app).post("/api/purchases").set("Authorization", `Bearer ${token}`).send(createPurchasePayload(supplier.id));

    const response = await request(app).get("/api/purchases").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("should get purchase detail", async () => {
    const { user, token } = await createUser({ email: adminEmail, roleName: ROLES.ADMIN });
    const supplier = await createSupplier(user.id);

    const createResponse = await request(app).post("/api/purchases").set("Authorization", `Bearer ${token}`).send(createPurchasePayload(supplier.id));

    const purchaseId = createResponse.body.data.id;

    const response = await request(app).get(`/api/purchases/${purchaseId}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(purchaseId);
  });

  it("should update purchase", async () => {
    const { user, token } = await createUser({ email: adminEmail, roleName: ROLES.ADMIN });
    const supplier = await createSupplier(user.id);

    const createResponse = await request(app).post("/api/purchases").set("Authorization", `Bearer ${token}`).send(createPurchasePayload(supplier.id));

    const purchaseId = createResponse.body.data.id;

    const response = await request(app)
      .patch(`/api/purchases/${purchaseId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        supplierId: supplier.id,
        orderNo: createResponse.body.data.orderNo,
        orderDate: new Date().toISOString(),
        note: "Güncellendi",
        items: [
          {
            category: "SERVICE",
            serviceName: "Test Hizmet",
            quantity: 1,
            unitPrice: 100,
            totalWithoutTax: 100,
            taxAmount: 20,
            totalWithTax: 120,
          },
        ],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.note).toBe("Güncellendi");
    expect(response.body.data.items.length).toBe(1);
  });

  it("should reject unknown purchase detail", async () => {
    const { token } = await createUser({ email: adminEmail, roleName: ROLES.ADMIN });

    const response = await request(app).get("/api/purchases/unknown-purchase-id").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should soft delete purchase", async () => {
    const { user, token } = await createUser({ email: adminEmail, roleName: ROLES.ADMIN });
    const supplier = await createSupplier(user.id);

    const createResponse = await request(app).post("/api/purchases").set("Authorization", `Bearer ${token}`).send(createPurchasePayload(supplier.id));

    const purchaseId = createResponse.body.data.id;

    const response = await request(app).delete(`/api/purchases/${purchaseId}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const deletedPurchase = await prisma.purchaseOrder.findUnique({
      where: {
        id: purchaseId,
      },
    });

    expect(deletedPurchase.deletedAt).toBeTruthy();
  });
});
