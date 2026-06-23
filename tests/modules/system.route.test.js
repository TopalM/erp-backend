import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("System routes", () => {
  it("returns health with permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const res = await authRequest(user).get("/api/system/health");

    expect(res.status).toBe(200);
    expect(res.body.data.backend).toBe("online");
    expect(res.body.data.database).toBe("connected");
  });
});
