import { describe, it, expect } from "vitest";

import * as authService from "../../src/modules/auth/auth/auth.service.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";

describe("account lock security", () => {
  it("locks account after 5 failed login attempts", async () => {
    const user = await createTestUser({
      password: "Test123*",
    });

    for (let i = 0; i < 5; i += 1) {
      await expect(authService.login(user.email, "Wrong123*")).rejects.toMatchObject({
        statusCode: 401,
      });
    }

    const lockedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(lockedUser.failedLoginAttempts).toBe(5);
    expect(lockedUser.lockedUntil).toBeTruthy();
  });

  it("rejects login while account is locked", async () => {
    const user = await createTestUser({
      password: "Test123*",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 5,
        lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await expect(authService.login(user.email, "Test123*")).rejects.toMatchObject({
      statusCode: 423,
    });
  });
});
