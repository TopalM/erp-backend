import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser, createSuperAdmin } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("authorization regression security", () => {
  it("SUPER_ADMIN still bypasses permission checks", async () => {
    const user = await createSuperAdmin();

    const res = await api().get("/api/system/health").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
  });

  it("normal ADMIN does not bypass permission checks", async () => {
    const user = await createTestUser({
      roleName: "ADMIN",
    });

    const res = await api().get("/api/system/health").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("user with exact permission can access protected route", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const res = await api().get("/api/system/health").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
  });

  it("user with unrelated permission cannot access protected route", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.USER_READ],
    });

    const res = await api().get("/api/system/health").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("cannot access protected route without token", async () => {
    const res = await api().get("/api/system/health");

    expect(res.status).toBe(401);
  });

  it("cannot access protected route with malformed token", async () => {
    const res = await api().get("/api/system/health").set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
  });
});
