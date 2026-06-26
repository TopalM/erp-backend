import bcrypt from "bcryptjs";
import { AssignmentEntityType, AssignmentModule } from "@prisma/client";
import { describe, it, expect, beforeEach } from "vitest";

import * as service from "../../src/modules/platform/assignment/assignment.service.js";
import { prisma } from "../../src/database/prisma.client.js";

const MODULE = AssignmentModule.SALES ?? Object.values(AssignmentModule)[0];
const ENTITY_TYPE = AssignmentEntityType.SALES_ORDER ?? Object.values(AssignmentEntityType)[0];
const ROLE = "RESPONSIBLE";

const uniqueEmail = () => `assignment-cov-${Date.now()}-${Math.random()}@plastifay.com.tr`;
const uniqueEntityId = () => `assignment-cov-${Date.now()}-${Math.random()}`;

const getViewerRole = async () => {
  const role = await prisma.role.findUnique({ where: { name: "VIEWER" } });
  if (!role) throw new Error("VIEWER role seed edilmemiş.");
  return role;
};

const createUser = async () => {
  const role = await getViewerRole();

  return prisma.user.create({
    data: {
      firstName: "Assignment",
      lastName: "USER",
      email: uniqueEmail(),
      passwordHash: await bcrypt.hash("Test123*", 10),
      isActive: true,
      emailVerifiedAt: new Date(),
      roleId: role.id,
    },
  });
};

const asAdminUser = (user) => ({
  ...user,
  role: {
    name: "ADMIN",
  },
});

beforeEach(async () => {
  await prisma.assignment.deleteMany({
    where: {
      entityId: {
        contains: "assignment-cov-",
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "assignment-cov-",
      },
    },
  });
});

describe("assignment.service coverage", () => {
  it("lists assignments with filters", async () => {
    const user = await createUser();
    const creator = asAdminUser(await createUser());
    const entityId = uniqueEntityId();

    await service.createAssignmentService(
      {
        module: MODULE,
        entityType: ENTITY_TYPE,
        entityId,
        userId: user.id,
        role: ROLE,
        note: "Assigned",
      },
      creator,
    );

    const result = await service.listAssignmentsService(
      {
        module: MODULE,
        entityType: ENTITY_TYPE,
        entityId,
        userId: user.id,
        role: ROLE,
      },
      creator,
    );

    expect(result).toHaveLength(1);
    expect(result[0].entityId).toBe(entityId);
    expect(result[0].userId).toBe(user.id);
    expect(result[0].role).toBe(ROLE);
    expect(result[0].user).toBeTruthy();
    expect(result[0].createdBy).toBeTruthy();
  });

  it("creates assignment with upsert", async () => {
    const user = await createUser();
    const creator = asAdminUser(await createUser());
    const entityId = uniqueEntityId();

    const result = await service.createAssignmentService(
      {
        module: MODULE,
        entityType: ENTITY_TYPE,
        entityId,
        userId: user.id,
        role: ROLE,
        note: "Assigned",
      },
      creator,
    );

    expect(result.module).toBe(MODULE);
    expect(result.entityType).toBe(ENTITY_TYPE);
    expect(result.entityId).toBe(entityId);
    expect(result.userId).toBe(user.id);
    expect(result.role).toBe(ROLE);
    expect(result.note).toBe("Assigned");
    expect(result.createdById).toBe(creator.id);
  });

  it("creates assignment with default role and nullable note/creator", async () => {
    const user = await createUser();
    const entityId = uniqueEntityId();

    const result = await service.createAssignmentService(
      {
        module: MODULE,
        entityType: ENTITY_TYPE,
        entityId,
        userId: user.id,
      },
      null,
    );

    expect(result.role).toBe("RESPONSIBLE");
    expect(result.note).toBeNull();
    expect(result.createdById).toBeNull();
  });

  it("updates assignment note and role", async () => {
    const user = await createUser();
    const creator = asAdminUser(await createUser());

    const assignment = await service.createAssignmentService(
      {
        module: MODULE,
        entityType: ENTITY_TYPE,
        entityId: uniqueEntityId(),
        userId: user.id,
        role: ROLE,
        note: "Assigned",
      },
      creator,
    );

    const result = await service.updateAssignmentService(
      assignment.id,
      {
        role: "FOLLOWER",
        note: "Updated note",
      },
      creator,
    );

    expect(result.role).toBe("FOLLOWER");
    expect(result.note).toBe("Updated note");
  });

  it("updates assignment with empty payload", async () => {
    const user = await createUser();
    const creator = asAdminUser(await createUser());

    const assignment = await service.createAssignmentService(
      {
        module: MODULE,
        entityType: ENTITY_TYPE,
        entityId: uniqueEntityId(),
        userId: user.id,
        role: ROLE,
        note: "Assigned",
      },
      creator,
    );

    const result = await service.updateAssignmentService(assignment.id, {}, creator);

    expect(result.id).toBe(assignment.id);
    expect(result.role).toBe(ROLE);
    expect(result.note).toBe("Assigned");
  });

  it("throws when updating missing assignment", async () => {
    const creator = asAdminUser(await createUser());

    await expect(
      service.updateAssignmentService(
        "missing-assignment-id",
        {
          note: "Updated",
        },
        creator,
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("deletes assignment", async () => {
    const user = await createUser();
    const creator = asAdminUser(await createUser());

    const assignment = await service.createAssignmentService(
      {
        module: MODULE,
        entityType: ENTITY_TYPE,
        entityId: uniqueEntityId(),
        userId: user.id,
        role: ROLE,
        note: "Assigned",
      },
      creator,
    );

    await service.deleteAssignmentService(assignment.id, creator);

    const deleted = await prisma.assignment.findUnique({
      where: { id: assignment.id },
    });

    expect(deleted).toBeNull();
  });

  it("throws when deleting missing assignment", async () => {
    const creator = asAdminUser(await createUser());

    await expect(service.deleteAssignmentService("missing-assignment-id", creator)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("rejects update without user context", async () => {
    const user = await createUser();

    const assignment = await service.createAssignmentService({
      module: MODULE,
      entityType: ENTITY_TYPE,
      entityId: uniqueEntityId(),
      userId: user.id,
      role: ROLE,
    });

    await expect(service.updateAssignmentService(assignment.id, { note: "x" })).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("rejects delete without user context", async () => {
    const user = await createUser();

    const assignment = await service.createAssignmentService({
      module: MODULE,
      entityType: ENTITY_TYPE,
      entityId: uniqueEntityId(),
      userId: user.id,
      role: ROLE,
    });

    await expect(service.deleteAssignmentService(assignment.id)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("rejects update by unrelated user", async () => {
    const assignee = await createUser();
    const stranger = await createUser();

    const assignment = await service.createAssignmentService({
      module: MODULE,
      entityType: ENTITY_TYPE,
      entityId: uniqueEntityId(),
      userId: assignee.id,
      role: ROLE,
    });

    await expect(service.updateAssignmentService(assignment.id, { note: "x" }, stranger)).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});
