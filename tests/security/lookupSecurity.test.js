import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { ROLES } from "../../src/constants/roles.js";

describe("lookup security", () => {
  it("allows authenticated user to read lookup groups", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/lookups/groups").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("does not allow plain authenticated user to create lookup item", async () => {
    const user = await createTestUser();

    const res = await api().post("/api/lookups/groups/currencies/items").set("Authorization", authHeader(user)).send({
      value: "SECURITY_TEST",
      label: "Security Test",
      isActive: true,
    });

    expect(res.status).toBe(403);
  });

  it("does not allow plain authenticated user to update lookup item", async () => {
    const user = await createTestUser();

    const res = await api().patch("/api/lookups/groups/currencies/items/1").set("Authorization", authHeader(user)).send({
      value: "SECURITY_TEST_UPDATE",
      label: "Security Test Update",
      isActive: true,
    });

    expect(res.status).toBe(403);
  });

  it("does not allow plain authenticated user to delete lookup item", async () => {
    const user = await createTestUser();

    const res = await api().delete("/api/lookups/groups/currencies/items/1").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("rejects unauthenticated lookup access", async () => {
    const res = await api().get("/api/lookups/groups");

    expect(res.status).toBe(401);
  });

  it("rejects invalid lookup group key", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/lookups/groups/__invalid_group__/items").set("Authorization", authHeader(user));

    expect([400, 404]).toContain(res.status);
  });

  it("handles suspicious search input safely", async () => {
    const user = await createTestUser();

    const res = await api()
      .get("/api/lookups/currencies")
      .query({
        search: "' OR 1=1 --",
      })
      .set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("rejects invalid pagination values safely", async () => {
    const user = await createTestUser();

    const res = await api()
      .get("/api/lookups/currencies")
      .query({
        page: "-1",
        limit: "abc",
      })
      .set("Authorization", authHeader(user));

    expect([200, 400]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });
});
