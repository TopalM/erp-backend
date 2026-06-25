import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
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

describe("audit log data minimization security", () => {
  it("does not expose passwordHash in user profile response", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/auth/me").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(res.body.data.passwordHash).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
  });

  it("does not expose passwordHash in users list response", async () => {
    const admin = await createRoleUser(ROLES.SUPER_ADMIN);

    const res = await api().get("/api/users").set("Authorization", authHeader(admin));

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
  });

  it("ADMIN cannot delete audit logs", async () => {
    const admin = await createRoleUser(ROLES.ADMIN);

    const res = await api().delete("/api/audit-logs").set("Authorization", authHeader(admin));

    expect(res.status).toBe(403);
  });

  it("normal user cannot read audit logs", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/audit-logs").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("SUPER_ADMIN can read audit logs", async () => {
    const superAdmin = await createRoleUser(ROLES.SUPER_ADMIN);

    const res = await api().get("/api/audit-logs").set("Authorization", authHeader(superAdmin));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
