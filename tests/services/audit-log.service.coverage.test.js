import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = {
  auditLog: {
    create: vi.fn(),
  },
};

let createAuditLog;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  prismaMock.auditLog.create.mockResolvedValue({
    id: "audit1",
  });

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: prismaMock,
  }));

  const module = await import("../../src/modules/platform/audit/audit-logs/audit-log.service.js");
  createAuditLog = module.createAuditLog;
});

describe("audit-log.service coverage", () => {
  it("creates audit log with full payload", async () => {
    await createAuditLog({
      actorUser: {
        id: "actor1",
        email: "actor@plastifay.com.tr",
      },
      entityType: "USER",
      entityId: "user1",
      action: "UPDATE",
      message: "Updated user",
      oldValue: { name: "Old" },
      newValue: { name: "New" },
      req: {
        ip: "127.0.0.1",
        headers: {
          "user-agent": "vitest-agent",
        },
      },
    });

    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorUserId: "actor1",
        actorEmail: "actor@plastifay.com.tr",
        entityType: "USER",
        entityId: "user1",
        action: "UPDATE",
        message: "Updated user",
        oldValue: { name: "Old" },
        newValue: { name: "New" },
        ipAddress: "127.0.0.1",
        userAgent: "vitest-agent",
      },
    });
  });

  it("creates audit log with default and null values", async () => {
    await createAuditLog({});

    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorUserId: null,
        actorEmail: null,
        entityType: "SYSTEM",
        entityId: null,
        action: "ERROR",
        message: null,
        oldValue: null,
        newValue: null,
        ipAddress: null,
        userAgent: null,
      },
    });
  });

  it("does not throw when audit log creation fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("db down");

    prismaMock.auditLog.create.mockRejectedValueOnce(error);

    await expect(
      createAuditLog({
        message: "should not fail main flow",
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith("Audit log could not be created:", error);

    consoleSpy.mockRestore();
  });
});
