import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const getAdminRole = async () => {
  return prisma.role.findFirstOrThrow({
    where: { name: ROLES.ADMIN },
  });
};

describe("mass assignment security", () => {
  it("profile update cannot change protected user fields", async () => {
    const user = await createTestUser();
    const adminRole = await getAdminRole();

    const res = await api().patch("/api/users/profile").set("Authorization", authHeader(user)).send({
      firstName: "Changed",
      lastName: "User",
      phone: "5551112233",
      preferredTheme: "dark",

      roleId: adminRole.id,
      isActive: false,
      tokenVersion: 999,
      emailVerified: false,
      passwordHash: "hacked",
    });

    expect(res.status).toBe(200);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(dbUser).toBeTruthy();

    expect(dbUser.firstName).toBe("Changed");
    expect(dbUser.lastName).toBe("USER");
    expect(dbUser.phone).toBe("5551112233");
    expect(dbUser.preferredTheme).toBe("dark");

    expect(dbUser.roleId).toBe(user.roleId);
    expect(dbUser.isActive).toBe(user.isActive);
    expect(dbUser.tokenVersion).toBe(user.tokenVersion);
    expect(dbUser.emailVerified).toBe(user.emailVerified);
    expect(dbUser.passwordHash).toBe(user.passwordHash);
  });
});
