import { describe, it, expect, beforeEach } from "vitest";

import * as service from "../../src/modules/organization/departments/department.service.js";
import { prisma } from "../../src/database/prisma.client.js";

const uniqueCode = () => `DEP_COV_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

const createDepartment = async (overrides = {}) => {
  return prisma.department.create({
    data: {
      code: overrides.code || uniqueCode(),
      name: overrides.name || "Coverage Department",
    },
  });
};

beforeEach(async () => {
  await prisma.department.deleteMany({
    where: {
      code: {
        startsWith: "DEP_COV_",
      },
    },
  });
});

describe("department.service coverage", () => {
  it("lists departments with search filter", async () => {
    const department = await createDepartment({
      name: "Coverage Department",
    });

    const result = await service.listDepartmentsService({
      search: "Coverage",
    });

    expect(result.some((item) => item.id === department.id)).toBe(true);
  });

  it("gets department by id", async () => {
    const department = await createDepartment({
      name: "Detail Department",
    });

    const result = await service.getDepartmentByIdService(department.id);

    expect(result.id).toBe(department.id);
  });

  it("throws when department detail not found", async () => {
    await expect(service.getDepartmentByIdService("missing-department-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("creates department with normalized code", async () => {
    const rawCode = ` test coverage dep ${Date.now()} `;

    const result = await service.createDepartmentService({
      code: rawCode,
      name: "Test Coverage Department",
    });

    expect(result.code).toMatch(/^TEST_COVERAGE_DEP_\d+$/);
    expect(result.name).toBe("Test Coverage Department");
  });

  it("throws duplicate error while creating department", async () => {
    const code = uniqueCode();

    await service.createDepartmentService({
      code,
      name: "Duplicate Department",
    });

    await expect(
      service.createDepartmentService({
        code,
        name: "Duplicate Department 2",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("updates department", async () => {
    const department = await prisma.department.create({
      data: {
        code: uniqueCode(),
        name: "Old Department",
      },
    });

    const newCode = uniqueCode();

    const result = await service.updateDepartmentService(department.id, {
      code: newCode,
      name: "Updated Department",
    });

    expect(result.code).toBe(newCode);
    expect(result.name).toBe("Updated Department");
  });

  it("throws when updating missing department", async () => {
    await expect(
      service.updateDepartmentService("missing-department-id", {
        name: "Missing",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("throws duplicate error while updating department", async () => {
    const code = uniqueCode();

    const first = await prisma.department.create({
      data: {
        code,
        name: "First Department",
      },
    });

    const second = await prisma.department.create({
      data: {
        code: uniqueCode(),
        name: "Second Department",
      },
    });

    await expect(
      service.updateDepartmentService(second.id, {
        code: first.code,
        name: "Second Updated",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("deletes department", async () => {
    const department = await createDepartment({
      name: "Delete Department",
    });

    const result = await service.deleteDepartmentService(department.id);

    expect(result.id).toBe(department.id);

    const deleted = await prisma.department.findUnique({
      where: { id: department.id },
    });

    expect(deleted).toBeNull();
  });

  it("throws when deleting missing department", async () => {
    await expect(service.deleteDepartmentService("missing-department-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
