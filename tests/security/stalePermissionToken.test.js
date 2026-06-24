import { describe, it, expect } from "vitest";

import { createTestUser, grantPermission } from "../setup/factories.js";

import { authRequest } from "../setup/auth.js";
import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("stale permission token security", () => {
  it("invalidates token after permission changes", async () => {
    const user = await createTestUser();

    const tokenRequest = authRequest(user);

    await grantPermission(user.id, PERMISSIONS.USER_READ, "ALLOW");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tokenVersion: {
          increment: 1,
        },
      },
    });

    const res = await tokenRequest.get("/api/users");

    expect(res.status).toBe(401);
  });
});
