import { describe, it, expect } from "vitest";
import { api } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";

describe("Auth login", () => {
  it("logs in active and verified user", async () => {
    const user = await createTestUser({
      password: "Test123*",
    });

    const res = await api().post("/api/auth/login").send({
      email: user.email,
      password: "Test123*",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe(user.email);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("rejects wrong password", async () => {
    const user = await createTestUser({
      password: "Test123*",
    });

    const res = await api().post("/api/auth/login").send({
      email: user.email,
      password: "Wrong123*",
    });

    expect(res.status).toBe(401);
  });

  it("rejects unverified user", async () => {
    const user = await createTestUser({
      password: "Test123*",
      emailVerified: false,
    });

    const res = await api().post("/api/auth/login").send({
      email: user.email,
      password: "Test123*",
    });

    expect(res.status).toBe(403);
  });
});
