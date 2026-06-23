import { describe, it, expect } from "vitest";

import * as authService from "../../src/modules/auth/auth/auth.service.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";

describe("auth.service", () => {
  it("logs in valid active verified user", async () => {
    const user = await createTestUser({
      password: "Test123*",
    });

    const result = await authService.login(user.email, "Test123*");

    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe(user.email);
    expect(result.user.passwordHash).toBeUndefined();
  });

  it("increments tokenVersion after successful login", async () => {
    const user = await createTestUser({
      password: "Test123*",
    });

    await authService.login(user.email, "Test123*");

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updatedUser.tokenVersion).toBe(user.tokenVersion + 1);
  });

  it("rejects wrong password", async () => {
    const user = await createTestUser({
      password: "Test123*",
    });

    await expect(authService.login(user.email, "Wrong123*")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("changes password with valid current password", async () => {
    const user = await createTestUser({
      password: "OldTest123*",
    });

    await authService.changePassword(user.id, "OldTest123*", "NewTest123*");

    await expect(authService.login(user.email, "NewTest123*")).resolves.toHaveProperty("token");
  });

  it("logs out by incrementing tokenVersion", async () => {
    const user = await createTestUser();

    await authService.logout(user.id);

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updatedUser.tokenVersion).toBe(user.tokenVersion + 1);
  });
});
