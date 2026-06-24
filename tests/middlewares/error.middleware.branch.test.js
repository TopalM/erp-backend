import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const auditMock = vi.hoisted(() => ({
  createAuditLog: vi.fn(),
}));

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const makeReq = () => ({
  user: {
    id: "user1",
    email: "test@plastifay.com.tr",
  },
  originalUrl: "/api/test",
  method: "GET",
  ip: "127.0.0.1",
  headers: {
    "user-agent": "vitest",
  },
});

let middleware;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  vi.doMock("../../src/modules/platform/audit/audit-logs/audit-log.service.js", () => auditMock);

  middleware = await import("../../src/middlewares/error.middleware.js");
});

afterEach(() => {
  vi.doUnmock("../../src/modules/platform/audit/audit-logs/audit-log.service.js");
});

describe("error.middleware branch coverage", () => {
  it("handles not found routes", () => {
    const res = makeRes();

    middleware.notFoundHandler({}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "İstenen endpoint bulunamadı.",
      }),
    );
  });

  it("handles operational error without audit log", async () => {
    const error = new Error("Bad request");
    error.statusCode = 400;
    error.errors = [{ field: "name", message: "required" }];

    const res = makeRes();

    await middleware.globalErrorHandler(error, makeReq(), res, vi.fn());

    expect(auditMock.createAuditLog).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Bad request",
        errors: error.errors,
      }),
    );
  });

  it("handles 500 error in test mode with stack and audit log", async () => {
    const error = new Error("Database down");
    const req = makeReq();
    const res = makeRes();

    await middleware.globalErrorHandler(error, req, res, vi.fn());

    expect(auditMock.createAuditLog).toHaveBeenCalledWith({
      actorUser: req.user,
      action: "ERROR",
      module: "SYSTEM",
      message: "Database down",
      oldValue: null,
      newValue: expect.objectContaining({
        path: "/api/test",
        method: "GET",
        stack: expect.any(String),
      }),
      req,
    });

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Database down",
      }),
    );
  });

  it("hides 500 error details in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    vi.resetModules();
    vi.doMock("../../src/modules/platform/audit/audit-logs/audit-log.service.js", () => auditMock);

    middleware = await import("../../src/middlewares/error.middleware.js");

    const error = new Error("Secret internal error");
    const req = makeReq();
    const res = makeRes();

    await middleware.globalErrorHandler(error, req, res, vi.fn());

    expect(auditMock.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        newValue: {
          path: "/api/test",
          method: "GET",
          stack: undefined,
        },
      }),
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Sunucu tarafında beklenmeyen bir hata oluştu.",
        errors: null,
      }),
    );

    vi.unstubAllEnvs();
  });

  it("uses fallback message when error message is missing", async () => {
    const error = {
      statusCode: 500,
    };

    const req = makeReq();
    const res = makeRes();

    await middleware.globalErrorHandler(error, req, res, vi.fn());

    expect(auditMock.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Beklenmeyen sunucu hatası.",
      }),
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
