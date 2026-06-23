import { describe, it, expect } from "vitest";
import { authRequest } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("Audit routes", () => {
  it("lists audit logs with AUDIT_LOG_READ permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.AUDIT_LOG_READ],
    });

    const res = await authRequest(user).get("/api/audit-logs");

    expect(res.status).toBe(200);
  });

  it("lists auth event logs with SYSTEM_LOG_READ permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.SYSTEM_LOG_READ],
    });

    const res = await authRequest(user).get("/api/auth-event-logs");

    expect(res.status).toBe(200);
  });
});
