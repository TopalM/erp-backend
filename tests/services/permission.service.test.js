import { describe, it, expect } from "vitest";

import * as permissionService from "../../src/modules/auth/permissions/permission.service.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";

describe("permission.service", () => {
  it("creates permission with normalized code", async () => {
    const permission = await permissionService.createPermission({
      code: " Test.Permission ",
      name: "Test Permission",
      description: "Test",
    });

    expect(permission.code).toBe("test.permission");
  });

  it("prevents duplicate permission code", async () => {
    await permissionService.createPermission({
      code: "test.duplicate",
      name: "Test Duplicate",
    });

    await expect(
      permissionService.createPermission({
        code: "TEST.DUPLICATE",
        name: "Test Duplicate",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("updates permission", async () => {
    const permission = await permissionService.createPermission({
      code: "test.update",
      name: "Old",
    });

    const updated = await permissionService.updatePermission(permission.id, {
      name: "New",
      description: "Updated",
    });

    expect(updated.name).toBe("New");
    expect(updated.description).toBe("Updated");
  });

  it("updates user permissions", async () => {
    const user = await createTestUser();

    const permission = await permissionService.createPermission({
      code: "test.user_permission",
      name: "User Permission",
    });

    const result = await permissionService.updateUserPermissions(user.id, [
      {
        permissionId: permission.id,
        effect: "ALLOW",
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].permission.code).toBe("test.user_permission");
  });

  it("does not delete assigned permission", async () => {
    const user = await createTestUser();

    const permission = await permissionService.createPermission({
      code: "test.assigned",
      name: "Assigned",
    });

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
});

it("lists permissions ordered by code", async () => {
  await permissionService.createPermission({
    code: "test.list",
    name: "List",
  });

  const result = await permissionService.getPermissions();

  expect(Array.isArray(result)).toBe(true);
});

it("gets permission by id", async () => {
  const permission = await permissionService.createPermission({
    code: "test.get_by_id",
    name: "Get By Id",
  });

  const result = await permissionService.getPermissionById(permission.id);

  expect(result.id).toBe(permission.id);
});

it("throws when permission id is missing", async () => {
  await expect(permissionService.getPermissionById("missing-id")).rejects.toMatchObject({
    statusCode: 404,
  });
});

it("throws when updating missing permission", async () => {
  await expect(
    permissionService.updatePermission("missing-id", {
      name: "Missing",
    }),
  ).rejects.toMatchObject({
    statusCode: 404,
  });
});

it("prevents updating permission code to another existing code", async () => {
  const first = await permissionService.createPermission({
    code: "test.code_owner_1",
    name: "Owner 1",
  });

  await permissionService.createPermission({
    code: "test.code_owner_2",
    name: "Owner 2",
  });

  await expect(
    permissionService.updatePermission(first.id, {
      code: "test.code_owner_2",
    }),
  ).rejects.toMatchObject({
    statusCode: 409,
  });
});

it("updates permission code and clears empty description", async () => {
  const permission = await permissionService.createPermission({
    code: "test.update_code_old",
    name: "Old",
    description: "Desc",
  });

  const updated = await permissionService.updatePermission(permission.id, {
    code: " TEST.UPDATE_CODE_NEW ",
    name: " New Name ",
    description: "",
  });

  expect(updated.code).toBe("test.update_code_new");
  expect(updated.name).toBe("New Name");
  expect(updated.description).toBeNull();
});

it("throws when deleting missing permission", async () => {
  await expect(permissionService.deletePermission("missing-id")).rejects.toMatchObject({
    statusCode: 404,
  });
});

it("deletes unassigned permission", async () => {
  const permission = await permissionService.createPermission({
    code: "test.delete_success",
    name: "Delete Success",
  });

  const deleted = await permissionService.deletePermission(permission.id);

  expect(deleted.id).toBe(permission.id);
});

it("gets user permissions", async () => {
  const user = await createTestUser();

  const permission = await permissionService.createPermission({
    code: "test.get_user_permissions",
    name: "Get User Permissions",
  });

  await permissionService.updateUserPermissions(user.id, [
    {
      permissionId: permission.id,
      effect: "ALLOW",
    },
  ]);

  const result = await permissionService.getUserPermissions(user.id);

  expect(result).toHaveLength(1);
  expect(result[0].permission.code).toBe("test.get_user_permissions");
});

it("throws when getting permissions for missing user", async () => {
  await expect(permissionService.getUserPermissions("missing-user")).rejects.toMatchObject({
    statusCode: 404,
  });
});

it("throws when updating permissions for missing user", async () => {
  await expect(permissionService.updateUserPermissions("missing-user", [])).rejects.toMatchObject({
    statusCode: 404,
  });
});

it("throws when updating user permissions with invalid permission id", async () => {
  const user = await createTestUser();

  await expect(
    permissionService.updateUserPermissions(user.id, [
      {
        permissionId: "missing-permission",
        effect: "ALLOW",
      },
    ]),
  ).rejects.toMatchObject({
    statusCode: 400,
  });
});

it("clears user permissions when empty array is sent", async () => {
  const user = await createTestUser();

  const permission = await permissionService.createPermission({
    code: "test.clear_user_permissions",
    name: "Clear User Permissions",
  });

  await permissionService.updateUserPermissions(user.id, [
    {
      permissionId: permission.id,
      effect: "ALLOW",
    },
  ]);

  const result = await permissionService.updateUserPermissions(user.id, []);

  expect(result).toHaveLength(0);
});
