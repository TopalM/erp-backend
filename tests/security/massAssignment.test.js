import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";

describe("mass assignment security", () => {
  it("profile update cannot change protected user fields", async () => {
    const user = await createTestUser();

    const res = await api().patch("/api/users/profile").set("Authorization", authHeader(user)).send({
      firstName: "Changed",
      lastName: "User",
      isActive: false,
      roleId: "malicious-role-id",
      tokenVersion: 999,
    });

    expect(res.status).toBe(200);

    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    expect(dbUser.firstName).toBe("Changed");
    expect(dbUser.lastName).toBe("USER");
    expect(dbUser.isActive).toBe(true);
    expect(dbUser.roleId).toBe(user.roleId);
    expect(dbUser.tokenVersion).toBe(user.tokenVersion);
  });
});
