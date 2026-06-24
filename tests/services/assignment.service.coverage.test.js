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
    const creator = await createUser();
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
      creator.id,
    );

    const result = await service.listAssignmentsService({
      module: MODULE,
      entityType: ENTITY_TYPE,
      entityId,
      userId: user.id,
      role: ROLE,
    });

    expect(result).toHaveLength(1);
    expect(result[0].entityId).toBe(entityId);
  });

  it("creates assignment with upsert", async () => {
    const user = await createUser();
    const creator = await createUser();
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
      creator.id,
    );

    expect(result).toBeTruthy();
    expect(result.module).toBe(MODULE);
    expect(result.entityType).toBe(ENTITY_TYPE);
    expect(result.entityId).toBe(entityId);
    expect(result.userId).toBe(user.id);
    expect(result.role).toBe(ROLE);
  });

  it("updates assignment", async () => {
    const user = await createUser();
    const creator = await createUser();

    const assignment = await service.createAssignmentService(
      {
        module: MODULE,
        entityType: ENTITY_TYPE,
        entityId: uniqueEntityId(),
        userId: user.id,
        role: ROLE,
        note: "Assigned",
      },
      creator.id,
    );

    const result = await service.updateAssignmentService(assignment.id, {
      note: "Updated note",
    });

    expect(result.note).toBe("Updated note");
  });

  it("deletes assignment", async () => {
    const user = await createUser();
    const creator = await createUser();

    const assignment = await service.createAssignmentService(
      {
        module: MODULE,
        entityType: ENTITY_TYPE,
        entityId: uniqueEntityId(),
        userId: user.id,
        role: ROLE,
        note: "Assigned",
      },
      creator.id,
    );

    await service.deleteAssignmentService(assignment.id);

    const deleted = await prisma.assignment.findUnique({
      where: { id: assignment.id },
    });

    expect(deleted).toBeNull();
  });
});
