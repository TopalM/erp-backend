import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("audit and auth security logs", () => {
  it("writes LOGIN_FAILED auth event on failed login", async () => {
    const user = await createTestUser({
      password: "Test123*",
    });

    await api().post("/api/auth/login").send({
      email: user.email,
      password: "Wrong123*",
    });

    const log = await prisma.authEventLog.findFirst({
      where: {
        email: user.email,
        event: "LOGIN_FAILED",
        success: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(log).toBeTruthy();
  });

  it("writes ACCOUNT_LOCKED auth event after repeated failed login", async () => {
    const user = await createTestUser({
      password: "Test123*",
    });

    for (let i = 0; i < 5; i += 1) {
      await api().post("/api/auth/login").send({
        email: user.email,
        password: "Wrong123*",
      });
    }

    const log = await prisma.authEventLog.findFirst({
      where: {
        email: user.email,
        event: "ACCOUNT_LOCKED",
        success: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(log).toBeTruthy();
  });

  it("writes audit log when user is deactivated", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.USER_UPDATE],
    });

    const target = await createTestUser();

    const res = await api().patch(`/api/users/${target.id}/deactivate`).set("Authorization", authHeader(actor));

    expect(res.status).toBe(200);

    const log = await prisma.auditLog.findFirst({
      where: {
        entityType: "USER",
        entityId: target.id,
        action: "USER_DEACTIVATED",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(log).toBeTruthy();
  });

  it("does not allow user without permission to read audit logs", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/audit-logs").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });
});
