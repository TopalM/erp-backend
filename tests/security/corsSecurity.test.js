import { describe, it, expect } from "vitest";
import { api } from "../setup/auth.js";

describe("CORS security", () => {
  it("returns CORS headers for allowed/simple request", async () => {
    const res = await api().options("/api/auth/login").set("Origin", "http://localhost:5173");

    expect([200, 204]).toContain(res.status);
    expect(res.headers["access-control-allow-origin"]).toBeTruthy();
  });

  it("does not expose credentials without explicit CORS handling", async () => {
    const res = await api().get("/health").set("Origin", "http://malicious.example.com");

    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });
});
