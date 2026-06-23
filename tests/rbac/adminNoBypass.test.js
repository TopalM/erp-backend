import { describe, it, expect } from "vitest";

import { authRequest } from "../setup/auth.js";
import { createAdmin } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("RBAC - ADMIN no bypass", () => {
  it("does not allow ADMIN without explicit permission", async () => {
    const user = await createAdmin();

    const res = await authRequest(user).get("/api/system/health");

    expect(res.status).toBe(403);
  });

  it("allows ADMIN with explicit permission", async () => {
    const user = await createAdmin({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const res = await authRequest(user).get("/api/system/health");

    expect(res.status).toBe(200);
  });
});
