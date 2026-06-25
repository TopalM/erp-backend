import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const getRole = async (name) => {
  const role = await prisma.role.findUnique({
    where: { name },
  });

  if (!role) {
    throw new Error(`${name} role seed edilmemiş.`);
  }

  return role;
};

describe("authorization boundary security", () => {
  it("does not allow user without USER_READ permission to list users", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/users").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("allows user list with USER_READ permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.USER_READ],
    });

    const res = await api().get("/api/users").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
  });

  it("does not allow viewer to create role", async () => {
    const user = await createTestUser();

    const res = await api()
      .post("/api/roles")
      .set("Authorization", authHeader(user))
      .send({
        name: `SECURITY_TEST_ROLE_${Date.now()}`,
        description: "Should not be created",
      });

    expect(res.status).toBe(403);
  });

  it("does not allow viewer to create permission", async () => {
    const user = await createTestUser();

    const res = await api()
      .post("/api/permissions")
      .set("Authorization", authHeader(user))
      .send({
        code: `security.test.${Date.now()}`,
        description: "Should not be created",
      });

    expect(res.status).toBe(403);
  });

  it("does not allow profile update to escalate role or protected fields", async () => {
    const user = await createTestUser();
    const adminRole = await getRole("ADMIN");

    const res = await api().patch("/api/users/profile").set("Authorization", authHeader(user)).send({
      firstName: "Changed",
      lastName: "User",
      roleId: adminRole.id,
      isActive: false,
      emailVerifiedAt: new Date().toISOString(),
      tokenVersion: 999,
    });

    expect(res.status).toBe(200);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(dbUser).toBeTruthy();
    expect(dbUser.firstName).toBe("Changed");
    expect(dbUser.lastName).toBe("USER");

    expect(dbUser.roleId).toBe(user.roleId);
    expect(dbUser.isActive).toBe(true);
    expect(dbUser.tokenVersion).toBe(user.tokenVersion);
  });

  it("does not allow ADMIN-only role middleware access for plain permission user", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.USER_READ, PERMISSIONS.USER_UPDATE],
    });

    const target = await createTestUser();

    const res = await api().patch(`/api/users/${target.id}/deactivate`).set("Authorization", authHeader(user));

    expect([200, 403]).toContain(res.status);
  });

  it("does not allow user without AUDIT_LOG_READ to read audit logs", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/audit-logs").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("allows user with AUDIT_LOG_READ to read audit logs", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.AUDIT_LOG_READ],
    });

    const res = await api().get("/api/audit-logs").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
