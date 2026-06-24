import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("SQL injection security", () => {
  it("does not break employee search with SQL injection payload", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.EMPLOYEE_READ],
    });

    const res = await authRequest(user).get("/api/employees?search=' OR 1=1 --");

    expect([200, 400]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it("does not break lookup search with SQL injection payload", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/lookups/blood-types?search='; DROP TABLE User; --");

    expect([200, 400]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it("does not allow injection in document filters", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_READ],
    });

    const res = await authRequest(user).get("/api/documents?module=SYSTEM' OR '1'='1");

    expect([200, 400]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });
});
