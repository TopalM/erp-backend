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

  it("rejects token after logout increments tokenVersion", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const oldToken = authHeader(user);

    const logoutRes = await api().post("/api/auth/logout").set("Authorization", oldToken);

    expect(logoutRes.status).toBe(200);

    const res = await api().get("/api/system/health").set("Authorization", oldToken);

    expect(res.status).toBe(401);
  });

  it("rejects token after force logout", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.USER_UPDATE],
      roleName: "SUPER_ADMIN",
    });

    const target = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const oldTargetToken = authHeader(target);

    const forceLogoutRes = await api().patch(`/api/users/${target.id}/force-logout`).set("Authorization", authHeader(actor));

    expect(forceLogoutRes.status).toBe(200);

    const res = await api().get("/api/system/health").set("Authorization", oldTargetToken);

    expect(res.status).toBe(401);
  });

  it("rejects token when database tokenVersion is newer than jwt tokenVersion", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const replayedToken = authHeader(user);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tokenVersion: user.tokenVersion + 5,
      },
    });

    const res = await api().get("/api/system/health").set("Authorization", replayedToken);

    expect(res.status).toBe(401);
  });
});
