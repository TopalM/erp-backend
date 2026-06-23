import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser, ensureRole } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("role and permission escalation security", () => {
  it("normal user cannot list permissions", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/permissions").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("normal user cannot update another user's role", async () => {
    const actor = await createTestUser();
    const target = await createTestUser();
    const adminRole = await ensureRole(ROLES.ADMIN);

    const res = await api().patch(`/api/users/${target.id}/role`).set("Authorization", authHeader(actor)).send({
      roleId: adminRole.id,
    });

    expect(res.status).toBe(403);
  });

  it("user with USER_ROLE_MANAGE can update role", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.USER_ROLE_MANAGE],
    });

    const target = await createTestUser();
    const adminRole = await ensureRole(ROLES.ADMIN);

    const res = await api().patch(`/api/users/${target.id}/role`).set("Authorization", authHeader(actor)).send({
      roleId: adminRole.id,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.roleId).toBe(adminRole.id);
  });

  it("user without USER_PERMISSION_MANAGE cannot change permissions", async () => {
    const actor = await createTestUser();
    const target = await createTestUser();

    const res = await api().put(`/api/permissions/user/${target.id}`).set("Authorization", authHeader(actor)).send({
      permissions: [],
    });

    expect(res.status).toBe(403);
  });

  it("user with USER_PERMISSION_MANAGE can change permissions", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.USER_PERMISSION_MANAGE],
    });

    const target = await createTestUser();

    const permission = await prisma.permission.findUnique({
      where: {
        code: PERMISSIONS.FINANCE_READ,
      },
    });

    const res = await api()
      .put(`/api/permissions/user/${target.id}`)
      .set("Authorization", authHeader(actor))
      .send({
        permissions: [
          {
            permissionId: permission.id,
            effect: "ALLOW",
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].permission.code).toBe(PERMISSIONS.FINANCE_READ);
  });
});
