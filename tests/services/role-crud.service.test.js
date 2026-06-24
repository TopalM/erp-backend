import { describe, it, expect } from "vitest";

import * as roleService from "../../src/modules/auth/roles/role.service.js";
import { prisma } from "../../src/database/prisma.client.js";

const uniqueRoleName = () => `TEST_ROLE_${Date.now()}_${Math.round(Math.random() * 1e9)}`;

describe("role CRUD service", () => {
  it("lists roles", async () => {
    const roles = await roleService.listRolesService();

    expect(Array.isArray(roles)).toBe(true);
  });

  it("creates role", async () => {
    const name = uniqueRoleName();

    const role = await roleService.createRoleService({
      name,
      description: "Test role",
    });

    expect(role.id).toBeTruthy();
    expect(role.name).toBe(name);
  });

  it("rejects duplicate role", async () => {
    const name = uniqueRoleName();

    await roleService.createRoleService({
      name,
      description: "First",
    });

    await expect(
      roleService.createRoleService({
        name,
        description: "Duplicate",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("gets role by id", async () => {
    const created = await roleService.createRoleService({
      name: uniqueRoleName(),
      description: "Get role",
    });

    const role = await roleService.getRoleByIdService(created.id);

    expect(role.id).toBe(created.id);
  });

  it("throws for missing role", async () => {
    await expect(roleService.getRoleByIdService("missing-role-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("updates role", async () => {
    const created = await roleService.createRoleService({
      name: uniqueRoleName(),
      description: "Old",
    });

    const newName = uniqueRoleName();

    const updated = await roleService.updateRoleService(created.id, {
      name: newName,
      description: "Updated",
    });

    expect(updated.name).toBe(newName);
  });

  it("deletes role", async () => {
    const created = await roleService.createRoleService({
      name: uniqueRoleName(),
      description: "Delete role",
    });

    const deleted = await roleService.deleteRoleService(created.id);

    expect(deleted.id).toBe(created.id);

    const exists = await prisma.role.findUnique({
      where: { id: created.id },
    });

    expect(exists).toBeNull();
  });

  it("does not delete protected role", async () => {
    const viewer = await prisma.role.findFirst({
      where: { name: "VIEWER" },
    });

    expect(viewer).toBeTruthy();

    await expect(roleService.deleteRoleService(viewer.id)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
