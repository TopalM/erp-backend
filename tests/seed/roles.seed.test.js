import { describe, it, expect } from "vitest";

import * as authService from "../../src/modules/auth/auth/auth.service.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";

describe("email verification security", () => {
  it("rejects login when email is not verified", async () => {
    const user = await createTestUser({
      password: "Test123*",
      emailVerified: false,
    });

    await expect(authService.login(user.email, "Test123*")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("verifies email with valid token", async () => {
    const user = await createTestUser({
      emailVerified: false,
    });

    const token = `verify-token-${Date.now()}`;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const verifiedUser = await authService.verifyEmail(token);

    expect(verifiedUser.emailVerifiedAt).toBeTruthy();
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(verifiedUser.emailVerifiedAt).toBeTruthy();

    expect(freshUser.emailVerificationToken).toBeNull();
    expect(freshUser.emailVerificationExpires).toBeNull();
  });

  it("rejects expired email verification token", async () => {
    const user = await createTestUser({
      emailVerified: false,
    });

    const token = `expired-token-${Date.now()}`;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() - 60 * 60 * 1000),
      },
    });

    await expect(authService.verifyEmail(token)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
