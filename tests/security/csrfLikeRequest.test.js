import { describe, it, expect } from "vitest";
import { createTestUser } from "../setup/factories.js";
import { authRequest } from "../setup/auth.js";

describe("csrf like request security", () => {
  it("does not authenticate using cookies only", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/system/health").unset?.("Authorization");

    expect([401, 403]).toContain(res.status);
  });

  it("requires bearer token", async () => {
    const res = await authRequest({
      id: "fake",
      tokenVersion: 0,
    }).get("/api/system/health");

    expect(res.status).not.toBe(200);
  });
});
