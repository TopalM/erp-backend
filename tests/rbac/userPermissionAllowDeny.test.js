import { describe, it, expect } from "vitest";

import { authRequest } from "../setup/auth.js";
import { createTestUser, grantPermission } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { prisma } from "../../src/database/prisma.client.js";

const getFreshUser = async (userId) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
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

describe("RBAC - user permission allow/deny", () => {
  it("allows user with ALLOW permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const res = await authRequest(user).get("/api/system/health");

    expect(res.status).toBe(200);
  });

  it("denies user without permission", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/system/health");

    expect(res.status).toBe(403);
  });

  it("DENY overrides ALLOW", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    await grantPermission(user.id, PERMISSIONS.SYSTEM_HEALTH_READ, "DENY");

    const freshUser = await getFreshUser(user.id);

    const res = await authRequest(freshUser).get("/api/system/health");

    expect(res.status).toBe(403);
  });
});
