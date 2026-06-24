import { describe, it, expect, vi, beforeEach } from "vitest";

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

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: prismaMock,
  }));

  service = await import("../../src/modules/organization/employees/employee.service.js");

  prismaMock.employee.findMany.mockResolvedValue([]);
  prismaMock.employee.findUnique.mockResolvedValue({
    id: "emp1",
    employeeCode: "EMP001",
  });

  prismaMock.department.findUnique.mockResolvedValue({ id: "dep1" });
  prismaMock.user.findUnique.mockResolvedValue({ id: "user1" });
  prismaMock.bloodType.findUnique.mockResolvedValue({ id: 1 });
  prismaMock.location.findUnique.mockResolvedValue({ id: 1 });
  prismaMock.city.findUnique.mockResolvedValue({ id: 1 });
  prismaMock.district.findUnique.mockResolvedValue({ id: 1, cityId: 1 });

  prismaMock.employee.create.mockImplementation(async ({ data }) => ({
    id: "emp1",
    ...data,
  }));

  prismaMock.employee.update.mockImplementation(async ({ where, data }) => ({
    id: where.id,
    ...data,
  }));

  prismaMock.employee.delete.mockResolvedValue({
    id: "emp1",
  });
});

describe("employee.service branch coverage", () => {
  it("lists employees with all filters", async () => {
    await service.listEmployeesService({
      search: "mustafa",
      status: "ACTIVE",
      type: "WHITE_COLLAR",
      departmentId: "dep1",
    });

    expect(prismaMock.employee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "ACTIVE",
          type: "WHITE_COLLAR",
          departmentId: "dep1",
          OR: expect.any(Array),
        }),
      }),
    );
  });

  it("throws when employee detail is missing", async () => {
    prismaMock.employee.findUnique.mockResolvedValueOnce(null);

    await expect(service.getEmployeeByIdService("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("creates employee with formatted and nullable fields", async () => {
    const result = await service.createEmployeeService({
      employeeCode: " EMP001 ",
      firstName: "mustafa   ali",
      lastName: "topal",
      phone: "",
      email: " TEST@PLASTIFAY.COM.TR ",
      identityNumber: "",
      birthDate: "",
      hireDate: "2026-01-01",
      leaveDate: null,
      title: " Engineer ",
      departmentId: "dep1",
      userId: "user1",
      bloodTypeId: 1,
      locationId: 1,
      cityId: 1,
      districtId: 1,
      address: " Address ",
      monthlySalary: "1000.50",
      salaryCurrency: "",
      note: "",
      type: "WHITE_COLLAR",
      status: "ACTIVE",
    });

    expect(result.employeeCode).toBe("EMP001");
    expect(result.firstName).toBe("Mustafa Ali");
    expect(result.lastName).toBe("TOPAL");
    expect(result.phone).toBeNull();
    expect(result.email).toBe("test@plastifay.com.tr");
    expect(result.identityNumber).toBeNull();
    expect(result.birthDate).toBeNull();
    expect(result.hireDate).toBeInstanceOf(Date);
    expect(result.leaveDate).toBeNull();
    expect(result.title).toBe("Engineer");
    expect(result.salaryCurrency).toBe("TRY");
    expect(result.note).toBeNull();
  });

  it("throws when department does not exist", async () => {
    prismaMock.department.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP001",
        firstName: "Ali",
        lastName: "Veli",
        departmentId: "missing",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Departman bulunamadı.",
    });
  });

  it("throws when user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP001",
        firstName: "Ali",
        lastName: "Veli",
        userId: "missing",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Kullanıcı bulunamadı.",
    });
  });

  it("throws when blood type does not exist", async () => {
    prismaMock.bloodType.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP001",
        firstName: "Ali",
        lastName: "Veli",
        bloodTypeId: 99,
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Kan grubu bulunamadı.",
    });
  });

  it("throws when location does not exist", async () => {
    prismaMock.location.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP001",
        firstName: "Ali",
        lastName: "Veli",
        locationId: 99,
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Lokasyon bulunamadı.",
    });
  });

  it("throws when city does not exist", async () => {
    prismaMock.city.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP001",
        firstName: "Ali",
        lastName: "Veli",
        cityId: 99,
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Şehir bulunamadı.",
    });
  });

  it("throws when district does not exist", async () => {
    prismaMock.district.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP001",
        firstName: "Ali",
        lastName: "Veli",
        districtId: 99,
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "İlçe bulunamadı.",
    });
  });

  it("throws when district does not belong to selected city", async () => {
    prismaMock.district.findUnique.mockResolvedValueOnce({
      id: 2,
      cityId: 999,
    });

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP001",
        firstName: "Ali",
        lastName: "Veli",
        cityId: 1,
        districtId: 2,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "İlçe seçilen şehre bağlı değildir.",
    });
  });

  it("maps create unique constraint error", async () => {
    prismaMock.employee.create.mockRejectedValueOnce({
      code: "P2002",
    });

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP001",
        firstName: "Ali",
        lastName: "Veli",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("rethrows unknown create error", async () => {
    prismaMock.employee.create.mockRejectedValueOnce(new Error("db down"));

    await expect(
      service.createEmployeeService({
        employeeCode: "EMP001",
        firstName: "Ali",
        lastName: "Veli",
      }),
    ).rejects.toThrow("db down");
  });

  it("maps update unique constraint error", async () => {
    prismaMock.employee.update.mockRejectedValueOnce({
      code: "P2002",
    });

    await expect(
      service.updateEmployeeService("emp1", {
        employeeCode: "EMP002",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("updates employee status without leaveDate", async () => {
    const result = await service.updateEmployeeStatusService("emp1", {
      status: "PASSIVE",
    });

    expect(result.status).toBe("PASSIVE");
  });

  it("updates employee status with leaveDate", async () => {
    await service.updateEmployeeStatusService("emp1", {
      status: "RESIGNED",
      leaveDate: "2026-01-01",
    });

    expect(prismaMock.employee.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "RESIGNED",
          leaveDate: expect.any(Date),
        }),
      }),
    );
  });

  it("throws when linking missing user", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.linkEmployeeUserService("emp1", "missing")).rejects.toMatchObject({
      statusCode: 404,
      message: "Kullanıcı bulunamadı.",
    });
  });

  it("maps link user unique constraint error", async () => {
    prismaMock.employee.update.mockRejectedValueOnce({
      code: "P2002",
    });

    await expect(service.linkEmployeeUserService("emp1", "user1")).rejects.toMatchObject({
      statusCode: 409,
      message: "Bu kullanıcı başka bir çalışan kaydına bağlı.",
    });
  });

  it("unlinks employee user", async () => {
    await service.unlinkEmployeeUserService("emp1");

    expect(prismaMock.employee.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          userId: null,
        },
      }),
    );
  });

  it("deletes employee", async () => {
    await service.deleteEmployeeService("emp1");

    expect(prismaMock.employee.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "emp1",
        },
      }),
    );
  });
});
