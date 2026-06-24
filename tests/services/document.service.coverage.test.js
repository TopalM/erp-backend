import { describe, it, expect, vi, beforeEach } from "vitest";

const employee = {
  id: "employee1",
  employeeCode: "EMP001",
  firstName: "Mustafa",
  lastName: "TOPAL",
};

let controller;
let serviceMocks;

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(async () => {
  vi.resetModules();

  serviceMocks = {
    listEmployeesService: vi.fn().mockResolvedValue([employee]),
    getEmployeeByIdService: vi.fn().mockResolvedValue(employee),
    createEmployeeService: vi.fn().mockResolvedValue(employee),
    updateEmployeeService: vi.fn().mockResolvedValue(employee),
    updateEmployeeStatusService: vi.fn().mockResolvedValue(employee),
    linkEmployeeUserService: vi.fn().mockResolvedValue(employee),
    unlinkEmployeeUserService: vi.fn().mockResolvedValue(employee),
    deleteEmployeeService: vi.fn().mockResolvedValue(employee),
  };

  vi.doMock("../../src/modules/organization/employees/employee.service.js", () => serviceMocks);

  controller = await import("../../src/modules/organization/employees/employee.controller.js");
});

describe("employee.controller coverage", () => {
  it("lists employees", async () => {
    const req = { query: { search: "mus", status: "ACTIVE", type: undefined, departmentId: undefined } };
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
