import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";

describe("tokenVersion security", () => {
  it("rejects old token after tokenVersion increment", async () => {
    const user = await createTestUser();

    const oldToken = authHeader(user);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tokenVersion: {
          increment: 1,
        },
      },
    });

    const res = await api().get("/api/auth/me").set("Authorization", oldToken);

    expect(res.status).toBe(401);
  });
});
