import { describe, it, expect } from "vitest";
import { api } from "../setup/auth.js";

describe("Auth register validation", () => {
  it("rejects non-Plastifay email", async () => {
    const res = await api().post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "Test123*",
    });

    expect(res.status).toBe(400);
  });

  it("rejects weak password", async () => {
    const res = await api().post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: "user+test-register@plastifay.com.tr",
      password: "123",
    });

    expect(res.status).toBe(400);
  });
});
