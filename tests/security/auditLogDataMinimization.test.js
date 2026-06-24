import { describe, it, expect } from "vitest";

import { createTestUser } from "../setup/factories.js";
import { authRequest } from "../setup/auth.js";
import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("audit log data minimization", () => {
  it("does not expose secrets in newly created audit log entries", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.AUDIT_LOG_READ],
    });

    await prisma.auditLog.create({
      data: {
        entityType: "SYSTEM",
        action: "ERROR",
        message: "Safe audit minimization test",
        oldValue: null,
        newValue: {
          path: "/safe-test",
          method: "GET",
        },
      },
    });

    const res = await authRequest(user).get("/api/audit-logs");

    expect(res.status).toBe(200);

    const targetLog = res.body.data.find((item) => item.message === "Safe audit minimization test");
    const body = JSON.stringify(targetLog);

    expect(body).not.toContain("passwordHash");
    expect(body).not.toContain("passwordResetToken");
    expect(body).not.toContain("emailVerificationToken");
  });
});
