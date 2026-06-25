import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { prisma } from "../../src/database/prisma.client.js";

const createDepartment = async () => {
  return prisma.department.create({
    data: {
      code: `SECURITY_DEPT_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      name: `Security Department ${Date.now()}`,
    },
  });
};

const createEmployee = async () => {
  const department = await createDepartment();
  const unique = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  return prisma.employee.create({
    data: {
      employeeCode: `SEC_EMP_${unique}`,
      firstName: "Security",
      lastName: "Employee",
      departmentId: department.id,
      status: "ACTIVE",
      type: "BLUE_COLLAR",
    },
  });
};

describe("employee IDOR security", () => {
  it("rejects employee list without EMPLOYEE_READ", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/employees").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("allows employee list with EMPLOYEE_READ", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.EMPLOYEE_READ],
    });

    const res = await api().get("/api/employees").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
  });

  it("rejects employee detail without EMPLOYEE_READ", async () => {
    const employee = await createEmployee();
    const user = await createTestUser();

    const res = await api().get(`/api/employees/${employee.id}`).set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("allows employee detail with EMPLOYEE_READ", async () => {
    const employee = await createEmployee();
    const user = await createTestUser({
      permissions: [PERMISSIONS.EMPLOYEE_READ],
    });

    const res = await api().get(`/api/employees/${employee.id}`).set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(employee.id);
  });

  it("rejects employee update without EMPLOYEE_UPDATE", async () => {
    const employee = await createEmployee();
    const user = await createTestUser({
      permissions: [PERMISSIONS.EMPLOYEE_READ],
    });

    const res = await api().patch(`/api/employees/${employee.id}`).set("Authorization", authHeader(user)).send({
      firstName: "Changed",
    });

    expect(res.status).toBe(403);
  });

  it("allows employee update with EMPLOYEE_UPDATE", async () => {
    const employee = await createEmployee();
    const user = await createTestUser({
      permissions: [PERMISSIONS.EMPLOYEE_UPDATE],
    });

    const res = await api().patch(`/api/employees/${employee.id}`).set("Authorization", authHeader(user)).send({
      firstName: "Changed",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe("Changed");
  });

  it("rejects employee delete without EMPLOYEE_DELETE", async () => {
    const employee = await createEmployee();
    const user = await createTestUser({
      permissions: [PERMISSIONS.EMPLOYEE_READ],
    });

    const res = await api().delete(`/api/employees/${employee.id}`).set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("allows employee delete with EMPLOYEE_DELETE", async () => {
    const employee = await createEmployee();
    const user = await createTestUser({
      permissions: [PERMISSIONS.EMPLOYEE_DELETE],
    });

    const res = await api().delete(`/api/employees/${employee.id}`).set("Authorization", authHeader(user));

    expect(res.status).toBe(200);

    const deleted = await prisma.employee.findUnique({
      where: { id: employee.id },
    });

    expect(deleted).toBeNull();
  });

  it("rejects employee user link without EMPLOYEE_UPDATE", async () => {
    const employee = await createEmployee();
    const targetUser = await createTestUser();
    const attacker = await createTestUser({
      permissions: [PERMISSIONS.EMPLOYEE_READ],
    });

    const res = await api().patch(`/api/employees/${employee.id}/link-user`).set("Authorization", authHeader(attacker)).send({
      userId: targetUser.id,
    });

    expect(res.status).toBe(403);
  });

  it("allows employee user link with EMPLOYEE_UPDATE", async () => {
    const employee = await createEmployee();
    const targetUser = await createTestUser();
    const updater = await createTestUser({
      permissions: [PERMISSIONS.EMPLOYEE_UPDATE],
    });

    const res = await api().patch(`/api/employees/${employee.id}/link-user`).set("Authorization", authHeader(updater)).send({
      userId: targetUser.id,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.userId).toBe(targetUser.id);
  });
});
