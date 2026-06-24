import { describe, it, expect } from "vitest";

import * as service from "../../src/modules/organization/departments/department.service.js";
import { prisma } from "../../src/database/prisma.client.js";

const uniqueCode = () => `TEST_DEPT_${Date.now()}_${Math.round(Math.random() * 1e9)}`;

const listDepartments = service.listDepartmentsService;
const createDepartment = service.createDepartmentService;
const getDepartmentById = service.getDepartmentByIdService;
const updateDepartment = service.updateDepartmentService;
const deleteDepartment = service.deleteDepartmentService;

describe("department.service", () => {
  it("creates department", async () => {
    const code = uniqueCode();

    const department = await createDepartment({
      code,
      name: "Test Department",
      description: "Test description",
      isActive: true,
    });

    expect(department.id).toBeTruthy();
    expect(department.code).toBe(code);
  });

  it("rejects duplicate department code", async () => {
    const code = uniqueCode();

    await createDepartment({ code, name: "First Department" });

    await expect(createDepartment({ code, name: "Second Department" })).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("lists departments", async () => {
    const code = uniqueCode();

    await createDepartment({ code, name: "List Test Department" });

    const result = await listDepartments({ search: "List Test" });

    expect(Array.isArray(result)).toBe(true);
    expect(result.some((item) => item.code === code)).toBe(true);
  });

  it("gets department by id", async () => {
    const created = await createDepartment({
      code: uniqueCode(),
      name: "Get Test Department",
    });

    const found = await getDepartmentById(created.id);

    expect(found.id).toBe(created.id);
  });

  it("throws not found for missing department", async () => {
    await expect(getDepartmentById("missing-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("updates department", async () => {
    const created = await createDepartment({
      code: uniqueCode(),
      name: "Old Department",
    });

    const updated = await updateDepartment(created.id, {
      name: "Updated Department",
      description: "Updated",
      isActive: false,
    });

    expect(updated.name).toBe("Updated Department");
  });

  it("deletes department", async () => {
    const created = await createDepartment({
      code: uniqueCode(),
      name: "Delete Department",
    });

    await deleteDepartment(created.id);

    const dbDepartment = await prisma.department.findUnique({
      where: { id: created.id },
    });

    expect(dbDepartment).toBeNull();
  });
});
