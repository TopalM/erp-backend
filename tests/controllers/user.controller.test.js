import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = {
  getUsers: vi.fn(),
  getPendingUsers: vi.fn(),
  activateUser: vi.fn(),
  deactivateUser: vi.fn(),
  updateUserRole: vi.fn(),
  updateUserDepartment: vi.fn(),
  forceLogoutUser: vi.fn(),
  updateProfile: vi.fn(),
  uploadProfilePhoto: vi.fn(),
  removeProfilePhoto: vi.fn(),
};

let controller;

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

beforeEach(async () => {
  vi.resetModules();
  vi.resetAllMocks();

  vi.doMock("../../src/modules/auth/users/user.service.js", () => mocks);

  controller = await import("../../src/modules/auth/users/user.controller.js");
});

afterEach(() => {
  vi.doUnmock("../../src/modules/auth/users/user.service.js");
  vi.resetModules();
});

describe("user.controller", () => {
  it("lists users", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.getUsers.mockResolvedValue([{ id: "u1" }]);

    await controller.getUsers({}, res, next);

    expect(mocks.getUsers).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it("lists pending users", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.getPendingUsers.mockResolvedValue([{ id: "u1" }]);

    await controller.getPendingUsers({}, res, next);

    expect(mocks.getPendingUsers).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it("activates user", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.activateUser.mockResolvedValue({ id: "u1" });

    await controller.activateUser({ params: { id: "u1" }, user: { id: "actor1" } }, res, next);

    expect(mocks.activateUser).toHaveBeenCalledWith("u1", { id: "actor1" }, expect.anything());
    expect(res.json).toHaveBeenCalled();
  });

  it("deactivates user", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.deactivateUser.mockResolvedValue({ id: "u1" });

    await controller.deactivateUser({ params: { id: "u1" }, user: { id: "actor1" } }, res, next);

    expect(mocks.deactivateUser).toHaveBeenCalledWith("u1", { id: "actor1" }, expect.anything());
    expect(res.json).toHaveBeenCalled();
  });

  it("updates user role", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.updateUserRole.mockResolvedValue({ id: "u1" });

    await controller.updateUserRole({ params: { id: "u1" }, body: { roleId: "r1" }, user: { id: "actor1" } }, res, next);

    expect(mocks.updateUserRole).toHaveBeenCalledWith("u1", "r1", { id: "actor1" }, expect.anything());
    expect(res.json).toHaveBeenCalled();
  });

  it("updates user department", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.updateUserDepartment.mockResolvedValue({ id: "u1" });

    await controller.updateUserDepartment({ params: { id: "u1" }, body: { departmentId: "d1" }, user: { id: "actor1" } }, res, next);

    expect(mocks.updateUserDepartment).toHaveBeenCalledWith("u1", "d1", { id: "actor1" }, expect.anything());
    expect(res.json).toHaveBeenCalled();
  });

  it("force logs out user", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.forceLogoutUser.mockResolvedValue({ id: "u1" });

    await controller.forceLogoutUser({ params: { id: "u1" }, user: { id: "actor1" } }, res, next);

    expect(mocks.forceLogoutUser).toHaveBeenCalledWith("u1", { id: "actor1" }, expect.anything());
    expect(res.json).toHaveBeenCalled();
  });

  it("updates own profile", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.updateProfile.mockResolvedValue({ id: "u1" });

    await controller.updateProfile({ user: { id: "u1" }, body: { firstName: "Test", lastName: "User" } }, res, next);

    expect(mocks.updateProfile).toHaveBeenCalledWith("u1", { firstName: "Test", lastName: "User" });
    expect(res.json).toHaveBeenCalled();
  });

  it("uploads profile photo", async () => {
    const res = createRes();
    const next = vi.fn();
    const file = { path: "/tmp/photo.png" };

    mocks.uploadProfilePhoto.mockResolvedValue({ id: "u1" });

    await controller.uploadProfilePhoto({ user: { id: "u1" }, file }, res, next);

    expect(mocks.uploadProfilePhoto).toHaveBeenCalledWith("u1", file);
    expect(res.json).toHaveBeenCalled();
  });

  it("removes profile photo", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.removeProfilePhoto.mockResolvedValue({ id: "u1" });

    await controller.removeProfilePhoto({ user: { id: "u1" } }, res, next);

    expect(mocks.removeProfilePhoto).toHaveBeenCalledWith("u1");
    expect(res.json).toHaveBeenCalled();
  });

  it("passes errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("user failed");

    mocks.getUsers.mockRejectedValueOnce(error);

    controller.getUsers({}, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalledWith(error);
  });
});
