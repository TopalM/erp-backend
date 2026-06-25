import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const getRole = (name) =>
  prisma.role.findFirstOrThrow({
    where: { name },
  });

const createUserWithRole = async (roleName) => {
  const role = await getRole(roleName);
  const user = await createTestUser();

  return prisma.user.update({
    where: { id: user.id },
    data: { roleId: role.id },
    include: {
      role: true,
      department: true,
      employee: true,
      userPermissions: {
        include: { permission: true },
      },
    },
  });
};

describe("auth event log security", () => {
  it("rejects unauthenticated auth event log list access", async () => {
    const res = await api().get("/api/auth-event-logs");

    expect(res.status).toBe(401);
  });

  it("rejects plain user from reading auth event logs", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/auth-event-logs").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("rejects admin from reading auth event logs", async () => {
    const admin = await createUserWithRole(ROLES.ADMIN);

    const res = await api().get("/api/auth-event-logs").set("Authorization", authHeader(admin));

    expect(res.status).toBe(403);
  });

  it("allows super admin to read auth event logs", async () => {
    const superAdmin = await createUserWithRole(ROLES.SUPER_ADMIN);

    const res = await api().get("/api/auth-event-logs").set("Authorization", authHeader(superAdmin));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("rejects plain user from deleting auth event logs", async () => {
    const user = await createTestUser();

    const res = await api().delete("/api/auth-event-logs").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("rejects admin from deleting auth event logs", async () => {
    const admin = await createUserWithRole(ROLES.ADMIN);

    const res = await api().delete("/api/auth-event-logs").set("Authorization", authHeader(admin));

    expect(res.status).toBe(403);
  });
});
