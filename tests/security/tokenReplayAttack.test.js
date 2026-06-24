import { describe, it, expect } from "vitest";

import { authHeader, api } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("token replay attack security", () => {
  it("rejects old token after user tokenVersion is incremented", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const oldToken = authHeader(user);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tokenVersion: {
          increment: 1,
        },
      },
    });

    const res = await api().get("/api/system/health").set("Authorization", oldToken);

    expect(res.status).toBe(401);
  });

  it("rejects token after force logout", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.USER_UPDATE],
    });

    const target = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const oldTargetToken = authHeader(target);

    await api().patch(`/api/users/${target.id}/force-logout`).set("Authorization", authHeader(actor));

    const res = await api().get("/api/system/health").set("Authorization", oldTargetToken);

    expect(res.status).toBe(401);
  });
});
