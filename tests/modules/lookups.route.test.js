import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createTestUser, createSuperAdmin } from "../setup/factories.js";

describe("Lookup routes", () => {
  it("lists lookups for authenticated user", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/lookups");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("lists blood types", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/lookups/blood-types");

    expect(res.status).toBe(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.rows)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
  });

  it("allows SUPER_ADMIN to access lookup group items", async () => {
    const user = await createSuperAdmin();

    const res = await authRequest(user).get("/api/lookups/groups/bloodTypes/items");

    expect(res.status).toBe(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.rows)).toBe(true);
  });
});
