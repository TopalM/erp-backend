import { describe, it, expect } from "vitest";
import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";

describe("XSS payload security", () => {
  it("profile update handles script payload without server error", async () => {
    const user = await createTestUser();

    const res = await api().patch("/api/users/profile").set("Authorization", authHeader(user)).send({
      firstName: "<script>alert(1)</script>",
      lastName: "USER",
    });

    expect([200, 400]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it("lookup search handles XSS payload without server error", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/lookups/blood-types?search=<img src=x onerror=alert(1)>").set("Authorization", authHeader(user));

    expect([200, 400]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });
});
