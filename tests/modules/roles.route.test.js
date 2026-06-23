import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("Roles routes", () => {
  it("lists roles with USER_ROLE_MANAGE permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.USER_ROLE_MANAGE],
    });

    const res = await authRequest(user).get("/api/roles");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("rejects roles without permission", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/roles");

    expect(res.status).toBe(403);
  });
});
