import { describe, it, expect } from "vitest";

import { createTestUser, grantPermission } from "../setup/factories.js";
import { authRequest } from "../setup/auth.js";
import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const getFreshUser = (id) =>
  prisma.user.findUnique({
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

describe("duplicate permission conflict", () => {
  it("deny wins over allow", async () => {
    const user = await createTestUser();

    await grantPermission(user.id, PERMISSIONS.USER_READ, "ALLOW");
    await grantPermission(user.id, PERMISSIONS.USER_READ, "DENY");

    const freshUser = await getFreshUser(user.id);

    const res = await authRequest(freshUser).get("/api/users");

    expect(res.status).toBe(403);
  });
});
