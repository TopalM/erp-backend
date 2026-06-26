import { describe, it, expect } from "vitest";

import { createTestUser } from "../setup/factories.js";

import {
  createAssignmentService,
  updateAssignmentService,
  deleteAssignmentService,
} from "../../src/modules/platform/assignment/assignment.service.js";

const payload = (userId) => ({
  module: "SYSTEM",
  entityType: "OTHER",
  entityId: `assignment-security-${Date.now()}-${Math.random()}`,
  userId,
  role: "RESPONSIBLE",
  note: "initial",
});

describe("assignment modification security", () => {
  it("does not allow unrelated user to update assignment", async () => {
    const creator = await createTestUser();
    const assignedUser = await createTestUser();
    const stranger = await createTestUser();

    const assignment = await createAssignmentService(payload(assignedUser.id), creator);

    await expect(updateAssignmentService(assignment.id, { note: "changed" }, stranger)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("allows creator to update assignment", async () => {
    const creator = await createTestUser();
    const assignedUser = await createTestUser();

    const assignment = await createAssignmentService(payload(assignedUser.id), creator);

    const result = await updateAssignmentService(assignment.id, { note: "changed" }, creator);

    expect(result.note).toBe("changed");
  });

  it("does not allow unrelated user to delete assignment", async () => {
    const creator = await createTestUser();
    const assignedUser = await createTestUser();
    const stranger = await createTestUser();

    const assignment = await createAssignmentService(payload(assignedUser.id), creator);

    await expect(deleteAssignmentService(assignment.id, stranger)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("allows admin to update assignment", async () => {
    const creator = await createTestUser();
    const assignedUser = await createTestUser();
    const admin = await createTestUser({
      roleName: "ADMIN",
    });

    const assignment = await createAssignmentService(payload(assignedUser.id), creator);

    const result = await updateAssignmentService(assignment.id, { note: "admin changed" }, admin);

    expect(result.note).toBe("admin changed");
  });

  it("allows creator to delete assignment", async () => {
    const creator = await createTestUser();
    const assignedUser = await createTestUser();

    const assignment = await createAssignmentService(payload(assignedUser.id), creator);

    const result = await deleteAssignmentService(assignment.id, creator);

    expect(result).toBeNull();
  });
});
