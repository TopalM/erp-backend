import { describe, it, expect } from "vitest";

import * as roleService from "../../src/modules/auth/roles/role.service.js";
import { ensureRole } from "../setup/factories.js";
import { ROLES } from "../../src/constants/roles.js";

describe("role.service", () => {
  it("creates role with normalized name", async () => {
    const role = await roleService.createRoleService({
      name: "test custom role",
    });

    expect(role.name).toBe("TEST_CUSTOM_ROLE");
  });

  it("prevents duplicate role", async () => {
    await roleService.createRoleService({
      name: "TEST_DUPLICATE_ROLE",
    });

    await expect(
      roleService.createRoleService({
        name: "test duplicate role",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("updates custom role", async () => {
    const role = await roleService.createRoleService({
      name: "TEST_UPDATE_ROLE",
    });

    const updated = await roleService.updateRoleService(role.id, {
      name: "TEST_UPDATED_ROLE",
    });

    expect(updated.name).toBe("TEST_UPDATED_ROLE");
  });

  it("does not update protected ADMIN role", async () => {
    const adminRole = await ensureRole(ROLES.ADMIN);

    await expect(
      roleService.updateRoleService(adminRole.id, {
        name: "TEST_ADMIN_UPDATED",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("deletes custom role", async () => {
    const role = await roleService.createRoleService({
      name: "TEST_DELETE_ROLE",
    });

    const deleted = await roleService.deleteRoleService(role.id);

    expect(deleted.id).toBe(role.id);
  });
});
