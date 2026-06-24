import { describe, it, expect } from "vitest";
import { api } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";

describe("brute force protection", () => {
  it("locks account after repeated failed login attempts", async () => {
    const user = await createTestUser({
      password: "Correct123*",
    });

    for (let i = 0; i < 5; i += 1) {
      await api()
        .post("/api/auth/login")
        .set("X-Forwarded-For", `172.16.1.${i + 1}`)
        .send({
          email: user.email,
          password: "Wrong123*",
        });
    }

    const res = await api().post("/api/auth/login").set("X-Forwarded-For", "172.16.1.99").send({
      email: user.email,
      password: "Correct123*",
    });

    expect([401, 423, 429]).toContain(res.status);
  });

  it("does not expose whether unknown email exists during brute force", async () => {
    const res = await api()
      .post("/api/auth/login")
      .set("X-Forwarded-For", "172.16.2.10")
      .send({
        email: `missing-${Date.now()}@plastifay.com.tr`,
        password: "Wrong123*",
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBeTruthy();
  });
});
