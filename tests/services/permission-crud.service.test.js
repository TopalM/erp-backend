import { describe, it, expect } from "vitest";

import * as permissionService from "../../src/modules/auth/permissions/permission.service.js";
import { prisma } from "../../src/database/prisma.client.js";
import { createTestUser } from "../setup/factories.js";

const uniqueCode = () => `test.permission.${Date.now()}.${Math.round(Math.random() * 1e9)}`;

describe("permission CRUD service", () => {
  it("lists permissions", async () => {
    const permissions = await permissionService.getPermissions();

    expect(Array.isArray(permissions)).toBe(true);
  });

  it("creates permission", async () => {
    const code = uniqueCode();

    const permission = await permissionService.createPermission({
      code,
      name: "Test Permission",
      description: "Test description",
    });

    expect(permission.id).toBeTruthy();
    expect(permission.code).toBe(code);
    expect(permission.name).toBe("Test Permission");
  });

  it("rejects duplicate permission", async () => {
    const code = uniqueCode();

    await permissionService.createPermission({
      code,
      name: "First Permission",
    });

    await expect(
      permissionService.createPermission({
        code,
        name: "Duplicate Permission",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("updates permission", async () => {
    const created = await permissionService.createPermission({
      code: uniqueCode(),
      name: "Old Permission",
      description: "Old description",
    });

    const newCode = uniqueCode();

    const updated = await permissionService.updatePermission(created.id, {
      code: newCode,
      name: "Updated Permission",
      description: "Updated description",
    });

    expect(updated.code).toBe(newCode);
    expect(updated.name).toBe("Updated Permission");
    expect(updated.description).toBe("Updated description");
  });

  it("does not delete assigned permission", async () => {
    const permission = await permissionService.createPermission({
      code: uniqueCode(),
      name: "Assigned Permission",
    });

    const user = await createTestUser();

    await prisma.userPermission.create({
      data: {
        userId: user.id,
        permissionId: permission.id,
        effect: "ALLOW",
      },
    });

    await expect(permissionService.deletePermission(permission.id)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("deletes unassigned permission", async () => {
    const permission = await permissionService.createPermission({
      code: uniqueCode(),
      name: "Delete Permission",
    });

    const deleted = await permissionService.deletePermission(permission.id);

    expect(deleted.id).toBe(permission.id);

    const exists = await prisma.permission.findUnique({
      where: { id: permission.id },
    });

    expect(exists).toBeNull();
  });

  it("gets and updates user permissions", async () => {
    const user = await createTestUser();

    const permission = await permissionService.createPermission({
      code: uniqueCode(),
      name: "User Permission",
    });

    await permissionService.updateUserPermissions(user.id, [
      {
        permissionId: permission.id,
        effect: "ALLOW",
      },
    ]);

    const userPermissions = await permissionService.getUserPermissions(user.id);

    expect(userPermissions).toHaveLength(1);
    expect(userPermissions[0].permissionId).toBe(permission.id);
    expect(userPermissions[0].effect).toBe("ALLOW");
  });
});
