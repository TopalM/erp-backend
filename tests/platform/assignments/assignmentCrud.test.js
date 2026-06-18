import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { env } from "../../../src/config/env.js";
import { prisma } from "../../../src/database/prisma.client.js";
import { ROLES } from "../../../src/constants/roles.js";

const creatorEmail = "assignment-creator-test@plastifay.com.tr";
const assignedEmail = "assignment-user-test@plastifay.com.tr";
const password = "Test12345";
const testEntityId = "assignment-test-entity-001";

const createUser = async ({ email, roleName = ROLES.ADMIN }) => {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Assignment",
      lastName: "Test",
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

describe("Assignment Platform Tests", () => {
  beforeEach(async () => {
    const emails = [creatorEmail, assignedEmail];

    await prisma.assignment.deleteMany({
      where: {
        entityId: {
          contains: "assignment-test-entity",
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

  it("should create assignment", async () => {
    const { token, user: creator } = await createUser({ email: creatorEmail });
    const { user: assignedUser } = await createUser({ email: assignedEmail });

    const response = await request(app)
      .post("/api/assignments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        module: "MAINTENANCE",
        entityType: "MAINTENANCE",
        entityId: testEntityId,
        userId: assignedUser.id,
        role: "RESPONSIBLE",
        note: "Bakım kaydı sorumlusu.",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.userId).toBe(assignedUser.id);
    expect(response.body.data.createdById).toBe(creator.id);
    expect(response.body.data.role).toBe("RESPONSIBLE");
  });

  it("should upsert duplicate assignment instead of creating duplicate row", async () => {
    const { token } = await createUser({ email: creatorEmail });
    const { user: assignedUser } = await createUser({ email: assignedEmail });

    const payload = {
      module: "MAINTENANCE",
      entityType: "MAINTENANCE",
      entityId: testEntityId,
      userId: assignedUser.id,
      role: "RESPONSIBLE",
      note: "İlk not.",
    };

    const firstResponse = await request(app).post("/api/assignments").set("Authorization", `Bearer ${token}`).send(payload);
    const secondResponse = await request(app)
      .post("/api/assignments")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...payload, note: "Güncel not." });

    expect(firstResponse.statusCode).toBe(201);
    expect(secondResponse.statusCode).toBe(201);
    expect(secondResponse.body.data.id).toBe(firstResponse.body.data.id);
    expect(secondResponse.body.data.note).toBe("Güncel not.");

    const count = await prisma.assignment.count({
      where: {
        entityId: testEntityId,
        userId: assignedUser.id,
        role: "RESPONSIBLE",
      },
    });

    expect(count).toBe(1);
  });

  it("should list assignments by entity", async () => {
    const { token } = await createUser({ email: creatorEmail });
    const { user: assignedUser } = await createUser({ email: assignedEmail });

    await prisma.assignment.create({
      data: {
        module: "MAINTENANCE",
        entityType: "MAINTENANCE",
        entityId: testEntityId,
        userId: assignedUser.id,
        role: "FOLLOWER",
      },
    });

    const response = await request(app)
      .get("/api/assignments")
      .query({ module: "MAINTENANCE", entityType: "MAINTENANCE", entityId: testEntityId })
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0].user.email).toBe(assignedEmail);
  });

  it("should update assignment", async () => {
    const { token } = await createUser({ email: creatorEmail });
    const { user: assignedUser } = await createUser({ email: assignedEmail });

    const assignment = await prisma.assignment.create({
      data: {
        module: "MAINTENANCE",
        entityType: "MAINTENANCE",
        entityId: testEntityId,
        userId: assignedUser.id,
        role: "FOLLOWER",
      },
    });

    const response = await request(app)
      .patch(`/api/assignments/${assignment.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "VIEWER", note: "Sadece görüntüleyici." });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.role).toBe("VIEWER");
    expect(response.body.data.note).toBe("Sadece görüntüleyici.");
  });

  it("should delete assignment", async () => {
    const { token } = await createUser({ email: creatorEmail });
    const { user: assignedUser } = await createUser({ email: assignedEmail });

    const assignment = await prisma.assignment.create({
      data: {
        module: "MAINTENANCE",
        entityType: "MAINTENANCE",
        entityId: testEntityId,
        userId: assignedUser.id,
        role: "FOLLOWER",
      },
    });

    const response = await request(app).delete(`/api/assignments/${assignment.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const deleted = await prisma.assignment.findUnique({ where: { id: assignment.id } });
    expect(deleted).toBeNull();
  });

  it("should reject assignment list without token", async () => {
    const response = await request(app).get("/api/assignments");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
