import { describe, it, expect } from "vitest";

import * as assignmentService from "../../src/modules/platform/assignment/assignment.service.js";
import { createTestUser } from "../setup/factories.js";

const asAdminUser = (user) => ({
  ...user,
  role: {
    name: "ADMIN",
  },
});

describe("assignment.service", () => {
  it("creates assignment", async () => {
    const user = await createTestUser();
    const creator = asAdminUser(await createTestUser());

    const assignment = await assignmentService.createAssignmentService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-assignment-service-${Date.now()}`,
        userId: user.id,
        role: "RESPONSIBLE",
        note: "test",
      },
      creator,
    );

    expect(assignment.userId).toBe(user.id);
    expect(assignment.createdById).toBe(creator.id);
  });

  it("lists assignments", async () => {
    const assignments = await assignmentService.listAssignmentsService({
      module: "SYSTEM",
    });

    expect(Array.isArray(assignments)).toBe(true);
  });

  it("updates assignment", async () => {
    const user = await createTestUser();
    const creator = asAdminUser(await createTestUser());

    const assignment = await assignmentService.createAssignmentService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-assignment-update-${Date.now()}`,
        userId: user.id,
        role: "RESPONSIBLE",
      },
      creator,
    );

    const updated = await assignmentService.updateAssignmentService(
      assignment.id,
      {
        role: "VIEWER",
        note: "updated",
      },
      creator,
    );

    expect(updated.role).toBe("VIEWER");
    expect(updated.note).toBe("updated");
  });

  it("deletes assignment", async () => {
    const user = await createTestUser();
    const creator = asAdminUser(await createTestUser());

    const assignment = await assignmentService.createAssignmentService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-assignment-delete-${Date.now()}`,
        userId: user.id,
        role: "RESPONSIBLE",
      },
      creator,
    );

    const result = await assignmentService.deleteAssignmentService(assignment.id, creator);

    expect(result).toBeNull();
  });
});
