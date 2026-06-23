import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { prisma } from "../../src/database/prisma.client.js";

const createAssignment = async ({ actor, assignee, entityId = `assignment-security-${Date.now()}` }) => {
  return api().post("/api/assignments").set("Authorization", authHeader(actor)).send({
    module: "SYSTEM",
    entityType: "OTHER",
    entityId,
    userId: assignee.id,
    role: "RESPONSIBLE",
  });
};

describe("assignment ownership/security", () => {
  it("rejects create without ASSIGNMENT_CREATE", async () => {
    const actor = await createTestUser();
    const assignee = await createTestUser();

    const res = await createAssignment({ actor, assignee });

    expect(res.status).toBe(403);
  });

  it("allows create with ASSIGNMENT_CREATE", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });
    const assignee = await createTestUser();

    const res = await createAssignment({ actor, assignee });

    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe(assignee.id);
  });

  it("rejects update without ASSIGNMENT_UPDATE", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });
    const assignee = await createTestUser();

    const created = await createAssignment({ actor, assignee });
    expect(created.status).toBe(201);

    const user = await createTestUser();

    const res = await api().patch(`/api/assignments/${created.body.data.id}`).set("Authorization", authHeader(user)).send({
      role: "VIEWER",
    });

    expect(res.status).toBe(403);
  });

  it("rejects delete without ASSIGNMENT_DELETE", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });
    const assignee = await createTestUser();

    const created = await createAssignment({ actor, assignee });
    expect(created.status).toBe(201);

    const user = await createTestUser();

    const res = await api().delete(`/api/assignments/${created.body.data.id}`).set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("keeps unique assignment per module entity user role", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });
    const assignee = await createTestUser();
    const entityId = `assignment-unique-${Date.now()}`;

    const first = await createAssignment({ actor, assignee, entityId });
    const second = await createAssignment({ actor, assignee, entityId });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.data.id).toBe(first.body.data.id);

    const count = await prisma.assignment.count({
      where: {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId,
        userId: assignee.id,
        role: "RESPONSIBLE",
      },
    });

    expect(count).toBe(1);
  });
});
