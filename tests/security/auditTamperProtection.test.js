import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("audit tamper protection", () => {
  it("does not allow audit log delete without AUDIT_LOG_DELETE", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.AUDIT_LOG_READ],
    });

    const res = await api().delete("/api/audit-logs").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("deletes only audit logs older than 180 days", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.AUDIT_LOG_DELETE],
    });

    const oldLog = await prisma.auditLog.create({
      data: {
        action: "ERROR",
        entityType: "SYSTEM",
        message: "Old audit log",
        createdAt: new Date(Date.now() - 181 * 24 * 60 * 60 * 1000),
      },
    });

    const freshLog = await prisma.auditLog.create({
      data: {
        action: "ERROR",
        entityType: "SYSTEM",
        message: "Fresh audit log",
        createdAt: new Date(),
      },
    });

    const res = await api().delete("/api/audit-logs").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);

    const oldAfterDelete = await prisma.auditLog.findUnique({
      where: { id: oldLog.id },
    });

    const freshAfterDelete = await prisma.auditLog.findUnique({
      where: { id: freshLog.id },
    });

    expect(oldAfterDelete).toBeNull();
    expect(freshAfterDelete).toBeTruthy();
  });

  it("does not expose audit logs without AUDIT_LOG_READ", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/audit-logs").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });
});
