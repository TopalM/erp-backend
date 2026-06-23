import { describe, it, expect } from "vitest";

import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateEmployeeStatusSchema,
  linkEmployeeUserSchema,
} from "../../src/modules/organization/employees/employee.validation.js";

describe("employee validation schemas", () => {
  it("accepts valid create employee payload", () => {
    const result = createEmployeeSchema.safeParse({
      employeeCode: "EMP-001",
      firstName: "Mustafa",
      lastName: "Topal",
      type: "WHITE_COLLAR",
      status: "ACTIVE",
      email: "mustafa+test@plastifay.com.tr",
      cityId: 34,
      districtId: 1,
      monthlySalary: "1000.50",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required create fields", () => {
    const result = createEmployeeSchema.safeParse({
      firstName: "Mustafa",
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative salary", () => {
    const result = createEmployeeSchema.safeParse({
      employeeCode: "EMP-001",
      firstName: "Mustafa",
      lastName: "Topal",
      monthlySalary: "-1",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid date", () => {
    const result = createEmployeeSchema.safeParse({
      employeeCode: "EMP-001",
      firstName: "Mustafa",
      lastName: "Topal",
      birthDate: "invalid-date",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty update payload", () => {
    const result = updateEmployeeSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("accepts status update payload", () => {
    const result = updateEmployeeStatusSchema.safeParse({
      status: "RESIGNED",
      leaveDate: "2026-06-23",
    });

    expect(result.success).toBe(true);
  });

  it("accepts link employee user payload", () => {
    const result = linkEmployeeUserSchema.safeParse({
      userId: "user-id",
    });

    expect(result.success).toBe(true);
  });
});
