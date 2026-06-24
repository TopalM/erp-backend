import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("inactive user access security", () => {
  it("rejects inactive user even with valid token and permission", async () => {
    const user = await createTestUser({
      isActive: false,
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const res = await authRequest(user).get("/api/system/health");

    expect(res.status).toBe(401);
  });
});
