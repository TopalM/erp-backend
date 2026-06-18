import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const adminEmail = "lookup-crud-admin-test@plastifay.com.tr";
const viewerEmail = "lookup-crud-viewer-test@plastifay.com.tr";
const defaultEmail = "lookup-crud-default-test@plastifay.com.tr";
const password = "Test12345";

const testCode = "RTEST";
const updatedTestCode = "RTEST-UPD";

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
      firstName: "Lookup",
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

const createUser = async () => {
  return createUserWithRole({
    email: defaultEmail,
    roleName: ROLES.ADMIN,
  });
};

const createReactorPayload = (overrides = {}) => {
  return {
    value: testCode,
    label: "Test Reaktör",
    extra: {
      name: "Test Reaktör",
      sortOrder: 999,
    },
    ...overrides,
  };
};

const createTestReactor = async () => {
  return prisma.productionReactor.create({
    data: {
      code: testCode,
      name: "Test Reaktör",
      sortOrder: 999,
      isActive: true,
    },
  });
};

describe("Lookup CRUD Tests", () => {
  beforeEach(async () => {
    await prisma.productionReactor.deleteMany({
      where: {
        code: {
          in: [testCode, updatedTestCode],
        },
      },
    });

    await prisma.authEventLog.deleteMany({
      where: {
        email: {
          in: [adminEmail, viewerEmail, defaultEmail],
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [adminEmail, viewerEmail, defaultEmail],
        },
      },
    });
  });

  it("should create lookup item", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app)
      .post("/api/lookups/groups/productionReactors/items")
      .set("Authorization", `Bearer ${token}`)
      .send(createReactorPayload());

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.value).toBe(testCode);

    const reactor = await prisma.productionReactor.findFirst({
      where: {
        code: testCode,
      },
    });

    expect(reactor).toBeTruthy();
  });

  it("should reject create lookup item without token", async () => {
    const response = await request(app).post("/api/lookups/groups/productionReactors/items").send(createReactorPayload());

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should reject viewer from creating lookup item", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const response = await request(app)
      .post("/api/lookups/groups/productionReactors/items")
      .set("Authorization", `Bearer ${token}`)
      .send(createReactorPayload());

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should update lookup item", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const reactor = await createTestReactor();

    const response = await request(app)
      .patch(`/api/lookups/groups/productionReactors/items/${reactor.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(
        createReactorPayload({
          value: updatedTestCode,
          label: "Test Reaktör Güncel",
          extra: {
            name: "Test Reaktör Güncel",
            sortOrder: 1000,
          },
        }),
      );

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.value).toBe(updatedTestCode);

    const updated = await prisma.productionReactor.findUnique({
      where: {
        id: reactor.id,
      },
    });

    expect(updated.code).toBe(updatedTestCode);
    expect(updated.name).toBe("Test Reaktör Güncel");
    expect(updated.sortOrder).toBe(1000);
  });

  it("should reject update lookup item without token", async () => {
    const reactor = await createTestReactor();

    const response = await request(app)
      .patch(`/api/lookups/groups/productionReactors/items/${reactor.id}`)
      .send(
        createReactorPayload({
          value: updatedTestCode,
        }),
      );

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should reject viewer from updating lookup item", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const reactor = await createTestReactor();

    const response = await request(app)
      .patch(`/api/lookups/groups/productionReactors/items/${reactor.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(
        createReactorPayload({
          value: updatedTestCode,
        }),
      );

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should reject update for unknown lookup item", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app)
      .patch("/api/lookups/groups/productionReactors/items/unknown-lookup-id")
      .set("Authorization", `Bearer ${token}`)
      .send(
        createReactorPayload({
          value: updatedTestCode,
        }),
      );

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should delete lookup item", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const reactor = await createTestReactor();

    const response = await request(app).delete(`/api/lookups/groups/productionReactors/items/${reactor.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const deleted = await prisma.productionReactor.findUnique({
      where: {
        id: reactor.id,
      },
    });

    expect(deleted.isActive).toBe(false);
  });

  it("should reject delete lookup item without token", async () => {
    const reactor = await createTestReactor();

    const response = await request(app).delete(`/api/lookups/groups/productionReactors/items/${reactor.id}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should reject viewer from deleting lookup item", async () => {
    const { token } = await createUserWithRole({
      email: viewerEmail,
      roleName: ROLES.VIEWER,
    });

    const reactor = await createTestReactor();

    const response = await request(app).delete(`/api/lookups/groups/productionReactors/items/${reactor.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should reject delete for unknown lookup item", async () => {
    const { token } = await createUserWithRole({
      email: adminEmail,
      roleName: ROLES.ADMIN,
    });

    const response = await request(app)
      .delete("/api/lookups/groups/productionReactors/items/unknown-lookup-id")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should allow authenticated user to get all lookups", async () => {
    const { token } = await createUser();

    const response = await request(app).get("/api/lookups").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.groups || response.body.data)).toBe(true);
  });

  it("should allow authenticated user to get lookup groups", async () => {
    const { token } = await createUser();

    const response = await request(app).get("/api/lookups/groups").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.groups || response.body.data)).toBe(true);
  });
});
