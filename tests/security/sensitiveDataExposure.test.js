import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { prisma } from "../../src/database/prisma.client.js";

const expectNoSensitiveUserFields = (user) => {
  expect(user.passwordHash).toBeUndefined();
  expect(user.passwordResetToken).toBeUndefined();
  expect(user.passwordResetExpires).toBeUndefined();
  expect(user.emailVerificationToken).toBeUndefined();
  expect(user.emailVerificationExpires).toBeUndefined();
};

describe("sensitive data exposure security", () => {
  it("does not expose password hash on /auth/me", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/auth/me").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expectNoSensitiveUserFields(res.body.data);
  });

  it("does not expose password hashes in users list", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.USER_READ],
    });

    const res = await api().get("/api/users").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);

    for (const item of res.body.data) {
      expectNoSensitiveUserFields(item);
    }
  });

  it("does not expose password hash after profile update", async () => {
    const user = await createTestUser();

    const res = await api().patch("/api/users/profile").set("Authorization", authHeader(user)).send({
      firstName: "mustafa",
      lastName: "topal",
      phone: "555",
      preferredTheme: "dark",
    });

    expect(res.status).toBe(200);
    expectNoSensitiveUserFields(res.body.data);
  });

  it("does not expose reset token in login response", async () => {
    const user = await createTestUser({
      password: "Test123*",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: `reset-token-${Date.now()}`,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const res = await api().post("/api/auth/login").send({
      email: user.email,
      password: "Test123*",
    });

    expect(res.status).toBe(200);
    expectNoSensitiveUserFields(res.body.data.user);
  });
});
