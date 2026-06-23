import { describe, it, expect } from "vitest";

import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

describe("super admin seed", () => {
  it("has seeded Mustafa super admin", async () => {
    const user = await prisma.user.findUnique({
      where: {
        email: "mustafa.topal@plastifay.com.tr",
      },
      include: {
        role: true,
      },
    });

    expect(user).toBeTruthy();
    expect(user.isActive).toBe(true);
    expect(user.emailVerifiedAt).toBeTruthy();
    expect(user.role.name).toBe(ROLES.SUPER_ADMIN);
  });

  it("has seeded Igal super admin", async () => {
    const user = await prisma.user.findUnique({
      where: {
        email: "igal.kovos@plastifay.com.tr",
      },
      include: {
        role: true,
      },
    });

    expect(user).toBeTruthy();
    expect(user.isActive).toBe(true);
    expect(user.emailVerifiedAt).toBeTruthy();
    expect(user.role.name).toBe(ROLES.SUPER_ADMIN);
  });
});
