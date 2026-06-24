import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = {
  listEmployeesService: vi.fn(),
  getEmployeeByIdService: vi.fn(),
  createEmployeeService: vi.fn(),
  updateEmployeeService: vi.fn(),
  updateEmployeeStatusService: vi.fn(),
  linkEmployeeUserService: vi.fn(),
  unlinkEmployeeUserService: vi.fn(),
  deleteEmployeeService: vi.fn(),
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

  Object.values(mocks).forEach((mock) => mock.mockReset());

  vi.doMock("../../src/modules/organization/employees/employee.service.js", () => mocks);

  controller = await import("../../src/modules/organization/employees/employee.controller.js");
});

afterEach(() => {
  vi.doUnmock("../../src/modules/organization/employees/employee.service.js");
  vi.resetModules();
  vi.clearAllMocks();
});

describe("employee.controller", () => {
  it("gets employees", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.listEmployeesService.mockResolvedValue([{ id: "emp1" }]);

    await controller.getEmployees(
      {
        query: {
          search: "test",
          status: "ACTIVE",
          type: "WHITE_COLLAR",
          departmentId: "dep1",
        },
      },
      res,
      next,
    );

    expect(mocks.listEmployeesService).toHaveBeenCalledWith({
      search: "test",
      status: "ACTIVE",
      type: "WHITE_COLLAR",
      departmentId: "dep1",
    });
    expect(res.json).toHaveBeenCalled();
  });

  it("gets employee by id", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.getEmployeeByIdService.mockResolvedValue({ id: "emp1" });

    await controller.getEmployeeById({ params: { id: "emp1" } }, res, next);

    expect(mocks.getEmployeeByIdService).toHaveBeenCalledWith("emp1");
    expect(res.json).toHaveBeenCalled();
  });

  it("creates employee", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.createEmployeeService.mockResolvedValue({ id: "emp1" });

    await controller.createEmployee({ body: { firstName: "Test" } }, res, next);

    expect(mocks.createEmployeeService).toHaveBeenCalledWith({ firstName: "Test" });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("updates employee", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.updateEmployeeService.mockResolvedValue({ id: "emp1" });

    await controller.updateEmployee({ params: { id: "emp1" }, body: { firstName: "Updated" } }, res, next);

    expect(mocks.updateEmployeeService).toHaveBeenCalledWith("emp1", { firstName: "Updated" });
  });

  it("updates employee status", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.updateEmployeeStatusService.mockResolvedValue({ id: "emp1" });

    await controller.updateEmployeeStatus({ params: { id: "emp1" }, body: { status: "PASSIVE" } }, res, next);

    expect(mocks.updateEmployeeStatusService).toHaveBeenCalledWith("emp1", { status: "PASSIVE" });
  });

  it("links employee user", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.linkEmployeeUserService.mockResolvedValue({ id: "emp1" });

    await controller.linkEmployeeUser({ params: { id: "emp1" }, body: { userId: "user1" } }, res, next);

    expect(mocks.linkEmployeeUserService).toHaveBeenCalledWith("emp1", "user1");
  });

  it("unlinks employee user", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.unlinkEmployeeUserService.mockResolvedValue({ id: "emp1" });

    await controller.unlinkEmployeeUser({ params: { id: "emp1" } }, res, next);

    expect(mocks.unlinkEmployeeUserService).toHaveBeenCalledWith("emp1");
  });

  it("deletes employee", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.deleteEmployeeService.mockResolvedValue({ id: "emp1" });

    await controller.deleteEmployee({ params: { id: "emp1" } }, res, next);

    expect(mocks.deleteEmployeeService).toHaveBeenCalledWith("emp1");
  });

  it("passes service errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("Service failed");

    mocks.listEmployeesService.mockRejectedValue(error);

    await controller.getEmployees({ query: {} }, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
