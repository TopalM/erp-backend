import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";

describe("pagination abuse security", () => {
  it("caps very large lookup limit", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/lookups/cities?limit=999999&page=1");

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.limit).toBeLessThanOrEqual(200);
  });

  it("normalizes invalid page values", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/lookups/cities?page=-999&limit=50");

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(1);
  });
});
