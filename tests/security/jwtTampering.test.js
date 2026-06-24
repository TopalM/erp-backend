import jwt from "jsonwebtoken";
import { describe, it, expect } from "vitest";
import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("JWT tampering security", () => {
  it("rejects token signed with wrong secret", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const token = jwt.sign(
      {
        userId: user.id,
        tokenVersion: user.tokenVersion,
      },
      "wrong-secret",
      { expiresIn: "1d" },
    );

    const res = await api().get("/api/system/health").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
  });

  it("rejects manually modified bearer token", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_HEALTH_READ],
    });

    const token = authHeader(user).replace("Bearer ", "");
    const tamperedToken = `${token.slice(0, -5)}abcde`;

    const res = await api().get("/api/system/health").set("Authorization", `Bearer ${tamperedToken}`);

    expect(res.status).toBe(401);
  });

  it("rejects token with elevated fake role but missing permission", async () => {
    const user = await createTestUser();

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: "SUPER_ADMIN",
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const res = await api().get("/api/system/health").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
