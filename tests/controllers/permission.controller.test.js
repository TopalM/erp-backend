import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = {
  getPermissions: vi.fn(),
  getPermissionById: vi.fn(),
  createPermission: vi.fn(),
  updatePermission: vi.fn(),
  deletePermission: vi.fn(),
  getUserPermissions: vi.fn(),
  updateUserPermissions: vi.fn(),
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

  vi.doMock("../../src/modules/auth/permissions/permission.service.js", () => mocks);

  controller = await import("../../src/modules/auth/permissions/permission.controller.js");
});

afterEach(() => {
  vi.doUnmock("../../src/modules/auth/permissions/permission.service.js");
  vi.resetModules();
});

describe("permission.controller", () => {
  it("lists permissions", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.getPermissions.mockResolvedValue([{ id: "p1" }]);

    await controller.getPermissions({}, res, next);

    expect(mocks.getPermissions).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it("gets permission by id", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.getPermissionById.mockResolvedValue({ id: "p1" });

    await controller.getPermissionById({ params: { id: "p1" } }, res, next);

    expect(mocks.getPermissionById).toHaveBeenCalledWith("p1");
    expect(res.json).toHaveBeenCalled();
  });

  it("creates permission", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.createPermission.mockResolvedValue({ id: "p1" });

    await controller.createPermission({ body: { code: "test.read", name: "Test Read" } }, res, next);

    expect(mocks.createPermission).toHaveBeenCalledWith({ code: "test.read", name: "Test Read" });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("updates permission", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.updatePermission.mockResolvedValue({ id: "p1" });

    await controller.updatePermission({ params: { id: "p1" }, body: { name: "Updated" } }, res, next);

    expect(mocks.updatePermission).toHaveBeenCalledWith("p1", { name: "Updated" });
    expect(res.json).toHaveBeenCalled();
  });

  it("deletes permission", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.deletePermission.mockResolvedValue({ id: "p1" });

    await controller.deletePermission({ params: { id: "p1" } }, res, next);

    expect(mocks.deletePermission).toHaveBeenCalledWith("p1");
    expect(res.json).toHaveBeenCalled();
  });

  it("gets user permissions", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.getUserPermissions.mockResolvedValue([{ id: "up1" }]);

    await controller.getUserPermissions({ params: { userId: "u1" } }, res, next);

    expect(mocks.getUserPermissions).toHaveBeenCalledWith("u1");
    expect(res.json).toHaveBeenCalled();
  });

  it("updates user permissions", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.updateUserPermissions.mockResolvedValue([{ id: "up1" }]);

    await controller.updateUserPermissions(
      {
        params: { userId: "u1" },
        body: {
          permissions: [{ permissionId: "p1", effect: "ALLOW" }],
        },
      },
      res,
      next,
    );

    expect(mocks.updateUserPermissions).toHaveBeenCalledWith("u1", [{ permissionId: "p1", effect: "ALLOW" }]);
    expect(res.json).toHaveBeenCalled();
  });

  it("passes errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("permission failed");

    mocks.getPermissions.mockRejectedValueOnce(error);

    controller.getPermissions({}, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalledWith(error);
  });
});
