import { describe, it, expect } from "vitest";

import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("permission constants and database", () => {
  it("database contains every permission constant", async () => {
    const dbPermissions = await prisma.permission.findMany({
      select: {
        code: true,
      },
    });

    const dbCodes = dbPermissions.map((permission) => permission.code);

    for (const code of Object.values(PERMISSIONS)) {
      expect(dbCodes).toContain(code);
    }
  });

  it("does not contain legacy underscore manage permission codes", async () => {
    const legacyCodes = ["user.permission_manage", "user.role_manage", "user.super_admin_manage"];

    const count = await prisma.permission.count({
      where: {
        code: {
          in: legacyCodes,
        },
      },
    });

    expect(count).toBe(0);
  });
});
