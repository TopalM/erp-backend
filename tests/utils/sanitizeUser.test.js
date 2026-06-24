import { describe, it, expect } from "vitest";
import { sanitizeUser } from "../../src/utils/sanitizeUser.js";

describe("sanitizeUser", () => {
  it("returns null when user is missing", () => {
    expect(sanitizeUser(null)).toBeNull();
  });

  it("removes passwordHash", () => {
    const user = {
      id: "1",
      email: "test@test.com",
      passwordHash: "secret",
    };

    const result = sanitizeUser(user);

    expect(result.passwordHash).toBeUndefined();
    expect(result.email).toBe("test@test.com");
  });
});
