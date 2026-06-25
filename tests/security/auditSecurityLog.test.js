import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { ROLES } from "../../src/constants/roles.js";

const createRoleUser = async (roleName) => {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`${roleName} role seed edilmemiş.`);
  }

  const user = await createTestUser();

  return prisma.user.update({
    where: { id: user.id },
    data: { roleId: role.id },
    include: {
      role: true,
      department: true,
      employee: {
        include: {
          department: true,
          location: true,
        },
      },
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

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

  it("writes audit log when user is activated", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.USER_UPDATE],
    });

    const target = await createTestUser();

    await prisma.user.update({
      where: { id: target.id },
      data: { isActive: false },
    });

    const res = await api().patch(`/api/users/${target.id}/activate`).set("Authorization", authHeader(actor));

    expect(res.status).toBe(200);

    const log = await prisma.auditLog.findFirst({
      where: {
        entityType: "USER",
        entityId: target.id,
        action: "USER_ACTIVATED",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(log).toBeTruthy();
  });

  it("writes audit log when user is force logged out", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.USER_UPDATE],
    });

    const target = await createTestUser();

    const res = await api().patch(`/api/users/${target.id}/force-logout`).set("Authorization", authHeader(actor));

    expect(res.status).toBe(200);

    const log = await prisma.auditLog.findFirst({
      where: {
        entityType: "USER",
        entityId: target.id,
        action: "USER_FORCE_LOGOUT",
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

  it("does not allow ADMIN to delete audit logs", async () => {
    const admin = await createRoleUser(ROLES.ADMIN);

    const res = await api().delete("/api/audit-logs").set("Authorization", authHeader(admin));

    expect(res.status).toBe(403);
  });

  it("allows SUPER_ADMIN to read audit logs", async () => {
    const superAdmin = await createRoleUser(ROLES.SUPER_ADMIN);

    const res = await api().get("/api/audit-logs").set("Authorization", authHeader(superAdmin));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
