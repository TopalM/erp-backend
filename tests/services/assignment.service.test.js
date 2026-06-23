import { describe, it, expect } from "vitest";

import * as assignmentService from "../../src/modules/platform/assignment/assignment.service.js";
import { createTestUser } from "../setup/factories.js";

describe("assignment.service", () => {
  it("creates assignment", async () => {
    const user = await createTestUser();
    const creator = await createTestUser();

    const assignment = await assignmentService.createAssignmentService(
      {
        module: "SYSTEM",
        entityType: "OTHER",
        entityId: `test-assignment-service-${Date.now()}`,
        userId: user.id,
        role: "RESPONSIBLE",
        note: "test",
      },
      creator.id,
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

    const assignment = await assignmentService.createAssignmentService({
      module: "SYSTEM",
      entityType: "OTHER",
      entityId: `test-assignment-update-${Date.now()}`,
      userId: user.id,
      role: "RESPONSIBLE",
    });

    const updated = await assignmentService.updateAssignmentService(assignment.id, {
      role: "VIEWER",
      note: "updated",
    });

    expect(updated.role).toBe("VIEWER");
    expect(updated.note).toBe("updated");
  });

  it("deletes assignment", async () => {
    const user = await createTestUser();

    const assignment = await assignmentService.createAssignmentService({
      module: "SYSTEM",
      entityType: "OTHER",
      entityId: `test-assignment-delete-${Date.now()}`,
      userId: user.id,
      role: "RESPONSIBLE",
    });

    const result = await assignmentService.deleteAssignmentService(assignment.id);

    expect(result).toBeNull();
  });
});
