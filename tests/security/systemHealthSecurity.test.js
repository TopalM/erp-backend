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

describe("system health security", () => {
  it("allows public health endpoint without auth", async () => {
    const res = await api().get("/health");

    expect(res.status).toBe(200);
  });

  it("rejects unauthenticated api system health access", async () => {
    const res = await api().get("/api/system/health");

    expect(res.status).toBe(401);
  });

  it("rejects plain user from api system health access", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/system/health").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("rejects plain user from api system health access", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/system/health").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("rejects admin from api system health access", async () => {
    const admin = await createUserWithRole(ROLES.ADMIN);

    const res = await api().get("/api/system/health").set("Authorization", authHeader(admin));

    expect(res.status).toBe(403);
  });

  it("allows super admin to access api system health", async () => {
    const superAdmin = await createUserWithRole(ROLES.SUPER_ADMIN);

    const res = await api().get("/api/system/health").set("Authorization", authHeader(superAdmin));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.database).toBeTruthy();
  });
});
