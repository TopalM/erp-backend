import { describe, it, expect } from "vitest";
import { api } from "../setup/auth.js";

describe("Helmet security headers", () => {
  it("sets common security headers", async () => {
    const res = await api().get("/health");

    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBeTruthy();
    expect(res.headers["content-security-policy"]).toBeTruthy();
  });

  it("does not expose x-powered-by", async () => {
    const res = await api().get("/health");

    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});
