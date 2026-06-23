import { describe, it, expect } from "vitest";
import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("authMiddleware", () => {
  it("rejects request without token", async () => {
    const res = await api().get("/api/system/health");

    expect(res.status).toBe(401);
  });

  it("rejects invalid token", async () => {
    const res = await api().get("/api/system/health").set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
  });

  it("accepts valid token but still requires permission", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/system/health").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("accepts valid token with required permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const res = await api().get("/api/system/health").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
  });
});
