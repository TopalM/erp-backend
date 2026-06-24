import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  employee: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  department: { findUnique: vi.fn() },
  user: { findUnique: vi.fn() },
  bloodType: { findUnique: vi.fn() },
  location: { findUnique: vi.fn() },
  city: { findUnique: vi.fn() },
  district: { findUnique: vi.fn() },
}));

let service;

const employee = {
  id: "emp1",
  employeeCode: "EMP001",
  firstName: "Mustafa",
  lastName: "TOPAL",
};

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: prismaMock,
  }));

  prismaMock.employee.findMany.mockResolvedValue([employee]);
  prismaMock.employee.findUnique.mockResolvedValue(employee);
  prismaMock.employee.create.mockResolvedValue(employee);
  prismaMock.employee.update.mockResolvedValue(employee);
  prismaMock.employee.delete.mockResolvedValue(employee);

  prismaMock.department.findUnique.mockResolvedValue({ id: "dep1" });
  prismaMock.user.findUnique.mockResolvedValue({ id: "user1" });
  prismaMock.bloodType.findUnique.mockResolvedValue({ id: 1 });
  prismaMock.location.findUnique.mockResolvedValue({ id: 1 });
  prismaMock.city.findUnique.mockResolvedValue({ id: 34 });
  prismaMock.district.findUnique.mockResolvedValue({ id: 3401, cityId: 34 });

  service = await import("../../src/modules/organization/employees/employee.service.js");
});

afterEach(() => {
  vi.doUnmock("../../src/database/prisma.client.js");
  vi.resetModules();
});

describe("employee.service coverage", () => {
  it("lists employees with filters and search", async () => {
    const result = await service.listEmployeesService({
      search: "mus",
      status: "ACTIVE",
      type: "WHITE_COLLAR",
      departmentId: "dep1",
    });

    expect(result).toHaveLength(1);
    expect(prismaMock.employee.findMany).toHaveBeenCalled();
  });

  it("throws when employee detail not found", async () => {
    prismaMock.employee.findUnique.mockResolvedValueOnce(null);

    await expect(service.getEmployeeByIdService("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("creates employee with normalized data", async () => {
    await service.createEmployeeService({
      employeeCode: " EMP001 ",
      firstName: " mustafa ",
      lastName: " topal ",
      departmentId: "dep1",
      userId: "user1",
      bloodTypeId: 1,
      locationId: 1,
      cityId: 34,
      districtId: 3401,
      monthlySalary: "1000.50",
      salaryCurrency: " usd ",
    });

    expect(prismaMock.employee.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employeeCode: "EMP001",
          firstName: "Mustafa",
          lastName: "TOPAL",
          salaryCurrency: "USD",
        }),
      }),
    );
  });

  it("defaults salary currency to TRY when empty", async () => {
    await service.createEmployeeService({
      employeeCode: "EMP002",
      firstName: "Test",
      lastName: "User",
      salaryCurrency: "",
    });

    expect(prismaMock.employee.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employeeCode: "EMP002",
          salaryCurrency: "TRY",
        }),
      }),
    );
  });

  it("throws when relation does not exist", async () => {
    prismaMock.department.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP003",
        firstName: "Test",
        lastName: "User",
        departmentId: "missing",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("throws when district does not belong to city", async () => {
    prismaMock.district.findUnique.mockResolvedValueOnce({ id: 3401, cityId: 35 });

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP004",
        firstName: "Test",
        lastName: "User",
        cityId: 34,
        districtId: 3401,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("maps create unique conflict to AppError", async () => {
    prismaMock.employee.create.mockRejectedValueOnce({ code: "P2002" });

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP005",
        firstName: "Test",
        lastName: "User",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("rethrows unknown create error", async () => {
    const error = new Error("db failed");
    prismaMock.employee.create.mockRejectedValueOnce(error);

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP006",
        firstName: "Test",
        lastName: "User",
      }),
    ).rejects.toBe(error);
  });

  it("updates employee", async () => {
    prismaMock.employee.update.mockResolvedValueOnce({
      ...employee,
      title: "Engineer",
      phone: "555",
    });

    const updated = await service.updateEmployeeService("emp1", {
      title: "Engineer",
      phone: "555",
    });

    expect(updated.title).toBe("Engineer");
    expect(updated.phone).toBe("555");
  });

  it("throws when updating missing employee", async () => {
    prismaMock.employee.findUnique.mockResolvedValueOnce(null);

    await expect(service.updateEmployeeService("missing", {})).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("maps update unique conflict to AppError", async () => {
    prismaMock.employee.update.mockRejectedValueOnce({ code: "P2002" });

    await expect(service.updateEmployeeService("emp1", {})).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("updates employee status with leave date", async () => {
    prismaMock.employee.update.mockResolvedValueOnce({
      ...employee,
      status: "RESIGNED",
      leaveDate: new Date("2026-01-01"),
    });

    const updated = await service.updateEmployeeStatusService("emp1", {
      status: "RESIGNED",
      leaveDate: "2026-01-01",
    });

    expect(updated.status).toBe("RESIGNED");
    expect(updated.leaveDate).toBeTruthy();
  });

  it("links employee to user", async () => {
    prismaMock.employee.update.mockResolvedValueOnce({
      ...employee,
      userId: "user1",
      type: "WHITE_COLLAR",
    });

    const linked = await service.linkEmployeeUserService("emp1", "user1");

    expect(linked.userId).toBe("user1");
    expect(linked.type).toBe("WHITE_COLLAR");
  });

  it("throws when linked user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.linkEmployeeUserService("emp1", "missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("maps link user unique conflict", async () => {
    prismaMock.employee.update.mockRejectedValueOnce({ code: "P2002" });

    await expect(service.linkEmployeeUserService("emp1", "user1")).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("unlinks employee user", async () => {
    prismaMock.employee.update.mockResolvedValueOnce({
      ...employee,
      userId: null,
    });

    const unlinked = await service.unlinkEmployeeUserService("emp1");

    expect(unlinked.userId).toBeNull();
  });

  it("deletes employee", async () => {
    await service.deleteEmployeeService("emp1");

    expect(prismaMock.employee.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "emp1" },
      }),
    );
  });
});
