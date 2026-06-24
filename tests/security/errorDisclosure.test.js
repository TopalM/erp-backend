import { describe, it, expect } from "vitest";

import { createTestUser } from "../setup/factories.js";
import { authRequest } from "../setup/auth.js";

describe("error disclosure security", () => {
  it("does not expose prisma internals", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/documents?module=INVALID_ENUM_VALUE");

    const body = JSON.stringify(res.body);

    expect(body).not.toContain("PrismaClient");
    expect(body).not.toContain("stack");
    expect(body).not.toContain("node_modules");
  });

  it("does not expose sql details", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/documents?module=' OR 1=1");

    const body = JSON.stringify(res.body);

    expect(body).not.toContain("SELECT");
    expect(body).not.toContain("INSERT");
    expect(body).not.toContain("UPDATE");
  });
});
