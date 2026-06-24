import bcrypt from "bcryptjs";
import { describe, it, expect } from "vitest";
import { api } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";

describe("password reset token reuse security", () => {
  it("does not allow reset token to be reused", async () => {
    const user = await createTestUser({
      password: "OldPass123*",
    });

    const token = `reset-token-${Date.now()}`;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const firstRes = await api().post("/api/auth/reset-password").send({
      token,
      password: "NewPass123*",
    });

    expect(firstRes.status).toBe(200);

    const secondRes = await api().post("/api/auth/reset-password").send({
      token,
      password: "Another123*",
    });

    expect(secondRes.status).toBe(400);

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    const isFirstPasswordValid = await bcrypt.compare("NewPass123*", updatedUser.passwordHash);
    expect(isFirstPasswordValid).toBe(true);
    expect(updatedUser.passwordResetToken).toBeNull();
    expect(updatedUser.passwordResetExpires).toBeNull();
  });
});
