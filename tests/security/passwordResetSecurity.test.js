import { describe, it, expect } from "vitest";

import * as authService from "../../src/modules/auth/auth/auth.service.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";

describe("password reset security", () => {
  it("rejects invalid password reset token", async () => {
    await expect(authService.newPassword("invalid-token", "NewTest123*")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects expired password reset token", async () => {
    const user = await createTestUser();

    const token = `expired-reset-${Date.now()}`;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() - 60 * 60 * 1000),
      },
    });

    await expect(authService.newPassword(token, "NewTest123*")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("resets password with valid token and clears token fields", async () => {
    const user = await createTestUser({
      password: "OldTest123*",
    });

    const token = `valid-reset-${Date.now()}`;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await authService.newPassword(token, "NewTest123*");

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updatedUser.passwordResetToken).toBeNull();
    expect(updatedUser.passwordResetExpires).toBeNull();
    expect(updatedUser.tokenVersion).toBe(user.tokenVersion + 1);

    await expect(authService.login(user.email, "NewTest123*")).resolves.toHaveProperty("token");
  });

  it("rejects weak new password", async () => {
    const user = await createTestUser();

    const token = `weak-reset-${Date.now()}`;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await expect(authService.newPassword(token, "12345678")).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
