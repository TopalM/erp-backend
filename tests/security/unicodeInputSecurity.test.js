import { describe, it, expect } from "vitest";
import { createTestUser } from "../setup/factories.js";
import { authRequest } from "../setup/auth.js";

describe("unicode input security", () => {
  it("handles unicode search safely", async () => {
    const user = await createTestUser();

    const payload = "🔥😀你好ПриветİĞÜŞÖÇ";

    const res = await authRequest(user).get(`/api/lookups/departments?search=${encodeURIComponent(payload)}`);

    expect(res.status).not.toBe(500);
  });
});
