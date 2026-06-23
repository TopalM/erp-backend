import { describe, it, expect } from "vitest";

import * as userService from "../../src/modules/auth/users/user.service.js";
import { createTestUser, ensureRole } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

describe("user.service", () => {
  it("lists users without passwordHash", async () => {
    await createTestUser();

    const users = await userService.getUsers();

    expect(users.length).toBeGreaterThan(0);
    expect(users[0].passwordHash).toBeUndefined();
  });

  it("updates own profile", async () => {
    const user = await createTestUser();

    const updatedUser = await userService.updateProfile(user.id, {
      firstName: "mustafa",
      lastName: "topal",
      phone: "555",
      preferredTheme: "dark",
    });

    expect(updatedUser.firstName).toBe("Mustafa");
    expect(updatedUser.lastName).toBe("TOPAL");
    expect(updatedUser.phone).toBe("555");
    expect(updatedUser.preferredTheme).toBe("dark");
  });

  it("activates inactive user and increments tokenVersion", async () => {
    const actor = await createTestUser({
      roleName: ROLES.SUPER_ADMIN,
    });

    const user = await createTestUser({
      isActive: false,
    });

    const activated = await userService.activateUser(user.id, actor);

    expect(activated.isActive).toBe(true);
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(freshUser.tokenVersion).toBe(user.tokenVersion + 1);
  });

  it("deactivates active user", async () => {
    const actor = await createTestUser({
      roleName: ROLES.SUPER_ADMIN,
    });

    const user = await createTestUser();

    const deactivated = await userService.deactivateUser(user.id, actor);

    expect(deactivated.isActive).toBe(false);
  });

  it("updates user role", async () => {
    const actor = await createTestUser({
      roleName: ROLES.SUPER_ADMIN,
    });

    const user = await createTestUser();
    const role = await ensureRole(ROLES.ADMIN);

    const updated = await userService.updateUserRole(user.id, role.id, actor);

    expect(updated.roleId).toBe(role.id);
    expect(updated.role.name).toBe(ROLES.ADMIN);
  });

  it("force logs out user by incrementing tokenVersion", async () => {
    const actor = await createTestUser({
      roleName: ROLES.SUPER_ADMIN,
    });

    const user = await createTestUser();

    await userService.forceLogoutUser(user.id, actor);

    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(freshUser.tokenVersion).toBe(user.tokenVersion + 1);
  });
});
