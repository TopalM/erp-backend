import { describe, it, expect } from "vitest";

import * as employeeService from "../../src/modules/organization/employees/employee.service.js";
import { createTestUser, uniqueId } from "../setup/factories.js";

describe("employee.service", () => {
  it("creates employee", async () => {
    const employee = await employeeService.createEmployeeService({
      employeeCode: `EMP-TEST-${uniqueId()}`,
      firstName: "mustafa",
      lastName: "topal",
      email: `employee+test-${uniqueId()}@plastifay.com.tr`,
    });

    expect(employee.firstName).toBe("Mustafa");
    expect(employee.lastName).toBe("TOPAL");
  });

  it("updates employee", async () => {
    const employee = await employeeService.createEmployeeService({
      employeeCode: `EMP-TEST-${uniqueId()}`,
      firstName: "Old",
      lastName: "User",
    });

    const updated = await employeeService.updateEmployeeService(employee.id, {
      title: "Engineer",
      phone: "555",
    });

    expect(updated.title).toBe("Engineer");
    expect(updated.phone).toBe("555");
  });

  it("updates employee status", async () => {
    const employee = await employeeService.createEmployeeService({
      employeeCode: `EMP-TEST-${uniqueId()}`,
      firstName: "Test",
      lastName: "User",
    });

    const updated = await employeeService.updateEmployeeStatusService(employee.id, {
      status: "RESIGNED",
      leaveDate: "2026-06-23",
    });

    expect(updated.status).toBe("RESIGNED");
    expect(updated.leaveDate).toBeTruthy();
  });

  it("links employee to user and sets WHITE_COLLAR", async () => {
    const user = await createTestUser();

    const employee = await employeeService.createEmployeeService({
      employeeCode: `EMP-TEST-${uniqueId()}`,
      firstName: "Test",
      lastName: "User",
    });

    const linked = await employeeService.linkEmployeeUserService(employee.id, user.id);

    expect(linked.userId).toBe(user.id);
    expect(linked.type).toBe("WHITE_COLLAR");
  });

  it("unlinks employee user", async () => {
    const user = await createTestUser();

    const employee = await employeeService.createEmployeeService({
      employeeCode: `EMP-TEST-${uniqueId()}`,
      firstName: "Test",
      lastName: "User",
      userId: user.id,
    });

    const unlinked = await employeeService.unlinkEmployeeUserService(employee.id);

    expect(unlinked.userId).toBeNull();
  });

  it("deletes employee", async () => {
    const employee = await employeeService.createEmployeeService({
      employeeCode: `EMP-TEST-${uniqueId()}`,
      firstName: "Test",
      lastName: "User",
    });

    const deleted = await employeeService.deleteEmployeeService(employee.id);

    expect(deleted.id).toBe(employee.id);
  });
});
