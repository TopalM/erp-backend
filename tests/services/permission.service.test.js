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
