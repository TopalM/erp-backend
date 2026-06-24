import { describe, it, expect } from "vitest";
import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { prisma } from "../../src/database/prisma.client.js";

describe("assignment permission boundary security", () => {
  it("ASSIGNMENT_READ cannot create assignment", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_READ],
    });

    const assignee = await createTestUser();

    const res = await api()
      .post("/api/assignments")
      .set("Authorization", authHeader(actor))
      .send({
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `assignment-boundary-${Date.now()}`,
        userId: assignee.id,
        role: "RESPONSIBLE",
      });

    expect(res.status).toBe(403);
  });

  it("ASSIGNMENT_CREATE cannot update assignment", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });

    const assignee = await createTestUser();

    const assignment = await prisma.assignment.create({
      data: {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `assignment-boundary-${Date.now()}`,
        userId: assignee.id,
        role: "RESPONSIBLE",
      },
    });

    const res = await api().patch(`/api/assignments/${assignment.id}`).set("Authorization", authHeader(actor)).send({
      note: "update attempt",
    });

    expect(res.status).toBe(403);
  });

  it("ASSIGNMENT_UPDATE cannot delete assignment", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_UPDATE],
    });

    const assignee = await createTestUser();

    const assignment = await prisma.assignment.create({
      data: {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `assignment-boundary-${Date.now()}`,
        userId: assignee.id,
        role: "RESPONSIBLE",
      },
    });

    const res = await api().delete(`/api/assignments/${assignment.id}`).set("Authorization", authHeader(actor));

    expect(res.status).toBe(403);
  });
});
