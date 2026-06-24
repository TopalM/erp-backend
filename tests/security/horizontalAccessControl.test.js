import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("horizontal access control security", () => {
  it("does not allow normal user to deactivate another user", async () => {
    const actor = await createTestUser();
    const target = await createTestUser();

    const res = await api().patch(`/api/users/${target.id}/deactivate`).set("Authorization", authHeader(actor));

    expect(res.status).toBe(403);
  });

  it("does not allow USER_UPDATE user to change another user's role without USER_ROLE_MANAGE", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.USER_UPDATE],
    });

    const target = await createTestUser();

    const res = await api().patch(`/api/users/${target.id}/role`).set("Authorization", authHeader(actor)).send({
      roleId: "fake-role-id",
    });

    expect(res.status).toBe(403);
  });

  it("allows profile update only for current authenticated user", async () => {
    const user = await createTestUser();

    const res = await api().patch("/api/users/profile").set("Authorization", authHeader(user)).send({
      firstName: "Updated",
      lastName: "USER",
      phone: "5551112233",
      preferredTheme: "dark",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(user.id);
    expect(res.body.data.firstName).toBe("Updated");
  });
});
