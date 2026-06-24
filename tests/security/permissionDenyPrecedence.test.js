import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createTestUser, grantPermission } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { prisma } from "../../src/database/prisma.client.js";

const getFreshUser = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      department: true,
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

describe("permission DENY precedence security", () => {
  it("DENY overrides existing ALLOW for same permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    await grantPermission(user.id, PERMISSIONS.SYSTEM_HEALTH_READ, "DENY");

    const freshUser = await getFreshUser(user.id);
    const res = await authRequest(freshUser).get("/api/system/health");

    expect(res.status).toBe(403);
  });

  it("different ALLOW permission does not bypass DENY", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.USER_READ, PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    await grantPermission(user.id, PERMISSIONS.SYSTEM_HEALTH_READ, "DENY");

    const freshUser = await getFreshUser(user.id);
    const res = await authRequest(freshUser).get("/api/system/health");

    expect(res.status).toBe(403);
  });
});
