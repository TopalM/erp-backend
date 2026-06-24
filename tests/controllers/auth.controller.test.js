import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = {
  register: vi.fn(),
  login: vi.fn(),
  changePassword: vi.fn(),
  verifyEmail: vi.fn(),
  forgetPassword: vi.fn(),
  newPassword: vi.fn(),
  logout: vi.fn(),
  resendVerificationEmail: vi.fn(),
};

let controller;

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  vi.doMock("../../src/modules/auth/auth/auth.service.js", () => mocks);

  controller = await import("../../src/modules/auth/auth/auth.controller.js");
});

afterEach(() => {
  vi.doUnmock("../../src/modules/auth/auth/auth.service.js");
  vi.resetModules();
});

describe("auth.controller", () => {
  it("registers user", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.register.mockResolvedValue({ id: "u1" });

    await controller.register({ body: { email: "test@plastifay.com.tr" } }, res, next);

    expect(mocks.register).toHaveBeenCalledWith({ email: "test@plastifay.com.tr" }, expect.anything());
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("logs in user", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.login.mockResolvedValue({ token: "token", user: { id: "u1" } });

    await controller.login({ body: { email: "test@plastifay.com.tr", password: "Test123*" } }, res, next);

    expect(mocks.login).toHaveBeenCalledWith("test@plastifay.com.tr", "Test123*", expect.anything());
    expect(res.json).toHaveBeenCalled();
  });

  it("returns me", async () => {
    const res = createRes();
    const next = vi.fn();

    await controller.me({ user: { id: "u1" } }, res, next);

    expect(res.json).toHaveBeenCalled();
  });

  it("changes password", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.changePassword.mockResolvedValue(null);

    await controller.changePassword(
      {
        user: { id: "u1" },
        body: { currentPassword: "Old123*", newPassword: "New123*" },
      },
      res,
      next,
    );

    expect(mocks.changePassword).toHaveBeenCalledWith("u1", "Old123*", "New123*", expect.anything());
  });

  it("verifies email", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.verifyEmail.mockResolvedValue({ id: "u1" });

    await controller.verifyEmail({ params: { token: "verify-token" } }, res, next);

    expect(mocks.verifyEmail).toHaveBeenCalledWith("verify-token", expect.anything());
  });

  it("starts forgot password", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.forgetPassword.mockResolvedValue(null);

    await controller.forgetPassword({ body: { email: "test@plastifay.com.tr" } }, res, next);

    expect(mocks.forgetPassword).toHaveBeenCalledWith("test@plastifay.com.tr", expect.anything());
  });

  it("sets new password", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.newPassword.mockResolvedValue(null);

    await controller.newPassword({ body: { token: "reset-token", password: "New123*" } }, res, next);

    expect(mocks.newPassword).toHaveBeenCalledWith("reset-token", "New123*", expect.anything());
  });

  it("logs out", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.logout.mockResolvedValue(null);

    await controller.logout({ user: { id: "u1" } }, res, next);

    expect(mocks.logout).toHaveBeenCalledWith("u1", expect.anything());
  });

  it("resends verification email", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.resendVerificationEmail.mockResolvedValue(null);

    await controller.resendVerificationEmail({ body: { email: "test@plastifay.com.tr" } }, res, next);

    expect(mocks.resendVerificationEmail).toHaveBeenCalledWith("test@plastifay.com.tr", expect.anything());
  });

  it("passes errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("auth failed");

    mocks.login.mockRejectedValueOnce(error);

    await controller.login(
      {
        body: {
          email: "test@plastifay.com.tr",
          password: "Wrong123*",
        },
      },
      res,
      next,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });
});
