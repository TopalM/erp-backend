import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("Permissions routes", () => {
  it("lists permissions with USER_PERMISSION_MANAGE permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.USER_PERMISSION_MANAGE],
    });

    const res = await authRequest(user).get("/api/permissions");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("rejects permissions without permission", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/permissions");

    expect(res.status).toBe(403);
  });
});
