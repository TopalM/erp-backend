import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createSuperAdmin } from "../setup/factories.js";

describe("RBAC - SUPER_ADMIN bypass", () => {
  it("allows SUPER_ADMIN to access protected permission route without explicit permission", async () => {
    const user = await createSuperAdmin();

    const res = await authRequest(user).get("/api/system/health");

    expect(res.status).toBe(200);
  });
});
