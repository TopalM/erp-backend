import { describe, it, expect } from "vitest";
import { api } from "../setup/auth.js";

describe("content type abuse security", () => {
  it("rejects text/plain login body", async () => {
    const res = await api()
      .post("/api/auth/login")
      .set("X-Forwarded-For", `10.99.1.${Date.now() % 200}`)
      .set("Content-Type", "text/plain")
      .send("email=test@test.com");

    expect([400, 415, 429]).toContain(res.status);
  });

  it("rejects malformed json", async () => {
    const res = await api()
      .post("/api/auth/login")
      .set("X-Forwarded-For", `10.99.2.${Date.now() % 200}`)
      .set("Content-Type", "application/json")
      .send('{"email":');

    expect(res.status).not.toBe(200);
  });
});
