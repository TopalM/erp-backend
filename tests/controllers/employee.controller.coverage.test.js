import { describe, it, expect, vi, beforeEach } from "vitest";

const serviceMocks = vi.hoisted(() => ({
  listEmployeesService: vi.fn(),
  getEmployeeByIdService: vi.fn(),
  createEmployeeService: vi.fn(),
  updateEmployeeService: vi.fn(),
  updateEmployeeStatusService: vi.fn(),
  linkEmployeeUserService: vi.fn(),
  unlinkEmployeeUserService: vi.fn(),
  deleteEmployeeService: vi.fn(),
}));

let controller;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  vi.doMock("../../src/modules/organization/employees/employee.service.js", () => ({
    ...serviceMocks,
  }));

  controller = await import("../../src/modules/organization/employees/employee.controller.js");
});

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const employee = {
  id: "employee1",
  employeeCode: "EMP001",
  firstName: "Mustafa",
  lastName: "TOPAL",
};

describe("employee.controller coverage", () => {
  it("lists employees", async () => {
    serviceMocks.listEmployeesService.mockResolvedValue([employee]);

    const req = { query: { search: "mus", status: "ACTIVE" } };
    const res = makeRes();
    const next = vi.fn();

    await controller.getEmployees(req, res, next);

    expect(serviceMocks.listEmployeesService).toHaveBeenCalledWith({
      search: "mus",
      status: "ACTIVE",
      type: undefined,
      departmentId: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("gets employee by id", async () => {
    serviceMocks.getEmployeeByIdService.mockResolvedValue(employee);

    const req = { params: { id: "employee1" } };
    const res = makeRes();
    const next = vi.fn();

    await controller.getEmployeeById(req, res, next);

    expect(serviceMocks.getEmployeeByIdService).toHaveBeenCalledWith("employee1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("creates employee", async () => {
    serviceMocks.createEmployeeService.mockResolvedValue(employee);

    const req = {
      body: {
        employeeCode: "EMP001",
        firstName: "Mustafa",
        lastName: "Topal",
      },
    };
    const res = makeRes();
    const next = vi.fn();

    await controller.createEmployee(req, res, next);

    expect(serviceMocks.createEmployeeService).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("updates employee", async () => {
    serviceMocks.updateEmployeeService.mockResolvedValue(employee);

    const req = {
      params: { id: "employee1" },
      body: { firstName: "Updated" },
    };
    const res = makeRes();
    const next = vi.fn();

    await controller.updateEmployee(req, res, next);

    expect(serviceMocks.updateEmployeeService).toHaveBeenCalledWith("employee1", req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("updates employee status", async () => {
    serviceMocks.updateEmployeeStatusService.mockResolvedValue(employee);

    const req = {
      params: { id: "employee1" },
      body: { status: "ACTIVE" },
    };
    const res = makeRes();
    const next = vi.fn();

    await controller.updateEmployeeStatus(req, res, next);

    expect(serviceMocks.updateEmployeeStatusService).toHaveBeenCalledWith("employee1", req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("links employee user", async () => {
    serviceMocks.linkEmployeeUserService.mockResolvedValue(employee);

    const req = {
      params: { id: "employee1" },
      body: { userId: "user1" },
    };
    const res = makeRes();
    const next = vi.fn();

    await controller.linkEmployeeUser(req, res, next);

    expect(serviceMocks.linkEmployeeUserService).toHaveBeenCalledWith("employee1", "user1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("unlinks employee user", async () => {
    serviceMocks.unlinkEmployeeUserService.mockResolvedValue(employee);

    const req = { params: { id: "employee1" } };
    const res = makeRes();
    const next = vi.fn();

    await controller.unlinkEmployeeUser(req, res, next);

    expect(serviceMocks.unlinkEmployeeUserService).toHaveBeenCalledWith("employee1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("deletes employee", async () => {
    serviceMocks.deleteEmployeeService.mockResolvedValue(employee);

    const req = { params: { id: "employee1" } };
    const res = makeRes();
    const next = vi.fn();

    await controller.deleteEmployee(req, res, next);

    expect(serviceMocks.deleteEmployeeService).toHaveBeenCalledWith("employee1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
