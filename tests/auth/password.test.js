import { describe, it, expect } from "vitest";
import { api, authRequest } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";

describe("Auth password flows", () => {
  it("forgot password returns generic success for unknown email", async () => {
    const res = await api().post("/api/auth/forgot-password").send({
      email: "unknown+test@plastifay.com.tr",
    });

    expect(res.status).toBe(200);
  });

  it("reset password rejects invalid token", async () => {
    const res = await api().post("/api/auth/reset-password").send({
      token: "invalid-token",
      password: "NewTest123*",
    });

    expect(res.status).toBe(400);
  });

  it("change password rejects wrong current password", async () => {
    const user = await createTestUser({
      password: "Test123*",
    });

    const res = await authRequest(user).post("/api/auth/change-password").send({
      currentPassword: "Wrong123*",
      newPassword: "NewTest123*",
    });

    expect(res.status).toBe(400);
  });
});
