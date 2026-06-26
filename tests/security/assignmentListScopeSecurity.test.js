import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { createAssignmentService } from "../../src/modules/platform/assignment/assignment.service.js";

const ASSIGNMENT_READ = PERMISSIONS.ASSIGNMENT_READ || "assignment.read";

const createUserWithAssignmentRead = () =>
  createTestUser({
    permissions: [ASSIGNMENT_READ],
  });

const uniqueEntityId = (prefix) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

const payload = (userId, prefix) => ({
  module: "SYSTEM",
  entityType: "OTHER",
  entityId: uniqueEntityId(prefix),
  userId,
  role: "RESPONSIBLE",
  note: prefix,
});

describe("assignment list scope security", () => {
  it("non-admin sees only assignments assigned to self or created by self", async () => {
    const owner = await createUserWithAssignmentRead();
    const assignedUser = await createUserWithAssignmentRead();
    const creator = await createUserWithAssignmentRead();
    const stranger = await createUserWithAssignmentRead();

    const testRunPrefix = uniqueEntityId("assignment-list-scope");

    const createdByOwner = await createAssignmentService(payload(assignedUser.id, `${testRunPrefix}-created-by-owner`), owner);

    const assignedToOwner = await createAssignmentService(payload(owner.id, `${testRunPrefix}-assigned-to-owner`), creator);

    const unrelated = await createAssignmentService(payload(stranger.id, `${testRunPrefix}-unrelated`), creator);

    const listRes = await api()
      .get("/api/assignments")
      .query({
        module: "SYSTEM",
        entityType: "OTHER",
      })
      .set("Authorization", authHeader(owner));

    expect(listRes.status).toBe(200);

    const ids = listRes.body.data.map((item) => item.id);

    expect(ids).toContain(createdByOwner.id);
    expect(ids).toContain(assignedToOwner.id);
    expect(ids).not.toContain(unrelated.id);
  });
});
