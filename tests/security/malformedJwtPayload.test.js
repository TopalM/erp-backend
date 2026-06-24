import jwt from "jsonwebtoken";
import { describe, it, expect } from "vitest";
import { api } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";

describe("malformed JWT payload security", () => {
  it("rejects token without userId", async () => {
    const token = jwt.sign(
      {
        email: "malformed@plastifay.com.tr",
        tokenVersion: 0,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const res = await api().get("/api/system/health").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
  });

  it("rejects token with wrong tokenVersion", async () => {
    const user = await createTestUser();

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role?.name,
        tokenVersion: 999,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const res = await api().get("/api/system/health").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
  });
});
