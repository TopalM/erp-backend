import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = {
  listRolesService: vi.fn(),
  getRoleByIdService: vi.fn(),
  createRoleService: vi.fn(),
  updateRoleService: vi.fn(),
  deleteRoleService: vi.fn(),
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

  vi.doMock("../../src/modules/auth/roles/role.service.js", () => mocks);

  controller = await import("../../src/modules/auth/roles/role.controller.js");
});

afterEach(() => {
  vi.doUnmock("../../src/modules/auth/roles/role.service.js");
  vi.resetModules();
});

describe("role.controller", () => {
  it("lists roles", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.listRolesService.mockResolvedValue([{ id: "r1" }]);

    await controller.listRoles({}, res, next);

    expect(mocks.listRolesService).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it("gets role by id", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.getRoleByIdService.mockResolvedValue({ id: "r1" });

    await controller.getRoleById({ params: { id: "r1" } }, res, next);

    expect(mocks.getRoleByIdService).toHaveBeenCalledWith("r1");
    expect(res.json).toHaveBeenCalled();
  });

  it("creates role", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.createRoleService.mockResolvedValue({ id: "r1" });

    await controller.createRole({ body: { name: "TEST_ROLE" } }, res, next);

    expect(mocks.createRoleService).toHaveBeenCalledWith({ name: "TEST_ROLE" });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("updates role", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.updateRoleService.mockResolvedValue({ id: "r1" });

    await controller.updateRole({ params: { id: "r1" }, body: { name: "UPDATED_ROLE" } }, res, next);

    expect(mocks.updateRoleService).toHaveBeenCalledWith("r1", { name: "UPDATED_ROLE" });
    expect(res.json).toHaveBeenCalled();
  });

  it("deletes role", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.deleteRoleService.mockResolvedValue({ id: "r1" });

    await controller.deleteRole({ params: { id: "r1" } }, res, next);

    expect(mocks.deleteRoleService).toHaveBeenCalledWith("r1");
    expect(res.json).toHaveBeenCalled();
  });

  it("passes errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("role failed");

    mocks.listRolesService.mockRejectedValueOnce(error);

    controller.listRoles({}, res, next);
    await flushPromises();

    expect(next).toHaveBeenCalledWith(error);
  });
});
