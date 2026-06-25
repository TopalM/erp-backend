import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const unique = () => `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

const createAssignment = async ({ userId, createdById = null, role = "RESPONSIBLE" }) => {
  const id = unique();

  return prisma.assignment.create({
    data: {
      module: "PURCHASING",
      entityType: "PURCHASE_REQUEST",
      entityId: `assignment-${id}`,
      userId,
      role,
      note: "Security assignment",
      createdById,
    },
  });
};

describe("assignment security", () => {
  it("rejects plain user from listing assignments", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/assignments").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("allows user with ASSIGNMENT_READ to list assignments", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_READ],
    });

    const res = await api().get("/api/assignments").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("rejects plain user from creating assignment", async () => {
    const actor = await createTestUser();
    const target = await createTestUser();

    const res = await api()
      .post("/api/assignments")
      .set("Authorization", authHeader(actor))
      .send({
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `assignment-create-${unique()}`,
        userId: target.id,
        role: "RESPONSIBLE",
        note: "Should not pass",
      });

    expect(res.status).toBe(403);
  });

  it("allows user with ASSIGNMENT_CREATE to create assignment", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });
    const target = await createTestUser();

    const res = await api()
      .post("/api/assignments")
      .set("Authorization", authHeader(actor))
      .send({
        module: "PURCHASING",
        entityType: "PURCHASE_REQUEST",
        entityId: `assignment-create-${unique()}`,
        userId: target.id,
        role: "RESPONSIBLE",
        note: "Allowed",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe(target.id);
    expect(res.body.data.createdById).toBe(actor.id);
  });

  it("rejects assignment update by non-creator even with ASSIGNMENT_UPDATE", async () => {
    const creator = await createTestUser();
    const target = await createTestUser();
    const otherUser = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_UPDATE],
    });

    const assignment = await createAssignment({
      userId: target.id,
      createdById: creator.id,
    });

    const res = await api().patch(`/api/assignments/${assignment.id}`).set("Authorization", authHeader(otherUser)).send({
      note: "Should not pass",
    });

    expect(res.status).toBe(403);
  });

  it("allows assignment creator with ASSIGNMENT_UPDATE to update own assignment", async () => {
    const creator = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_UPDATE],
    });
    const target = await createTestUser();

    const assignment = await createAssignment({
      userId: target.id,
      createdById: creator.id,
    });

    const res = await api().patch(`/api/assignments/${assignment.id}`).set("Authorization", authHeader(creator)).send({
      note: "Updated note",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.note).toBe("Updated note");
  });

  it("rejects assignment delete by non-creator even with ASSIGNMENT_DELETE", async () => {
    const creator = await createTestUser();
    const target = await createTestUser();
    const otherUser = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_DELETE],
    });

    const assignment = await createAssignment({
      userId: target.id,
      createdById: creator.id,
    });

    const res = await api().delete(`/api/assignments/${assignment.id}`).set("Authorization", authHeader(otherUser));

    expect(res.status).toBe(403);
  });

  it("allows assignment creator with ASSIGNMENT_DELETE to delete own assignment", async () => {
    const creator = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_DELETE],
    });
    const target = await createTestUser();

    const assignment = await createAssignment({
      userId: target.id,
      createdById: creator.id,
    });

    const res = await api().delete(`/api/assignments/${assignment.id}`).set("Authorization", authHeader(creator));

    expect(res.status).toBe(200);

    const dbAssignment = await prisma.assignment.findUnique({
      where: { id: assignment.id },
    });

    expect(dbAssignment).toBeNull();
  });
});
