import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("Users routes", () => {
  it("lists users with USER_READ permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.USER_READ],
    });

    const res = await authRequest(user).get("/api/users");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("rejects users list without USER_READ permission", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/users");

    expect(res.status).toBe(403);
  });

  it("updates own profile", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).patch("/api/users/profile").send({
      firstName: "Mustafa",
      lastName: "Topal",
      phone: "555",
      preferredTheme: "dark",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe("Mustafa");
    expect(res.body.data.lastName).toBe("TOPAL");
  });
});
