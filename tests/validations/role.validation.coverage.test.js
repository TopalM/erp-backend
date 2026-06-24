import { describe, it, expect } from "vitest";

import { createRoleSchema, updateRoleSchema } from "../../src/modules/auth/roles/role.validation.js";

describe("role.validation coverage", () => {
  it("validates and trims create role payload", () => {
    const result = createRoleSchema.parse({
      name: " ADMIN ",
    });

    expect(result).toEqual({
      name: "ADMIN",
    });
  });

  it("rejects empty create role name", () => {
    expect(() =>
      createRoleSchema.parse({
        name: "   ",
      }),
    ).toThrow("Rol adı zorunludur.");
  });

  it("allows partial role update with name", () => {
    const result = updateRoleSchema.parse({
      name: " VIEWER ",
    });

    expect(result).toEqual({
      name: "VIEWER",
    });
  });

  it("rejects empty role update body", () => {
    expect(() => updateRoleSchema.parse({})).toThrow("Güncellenecek en az bir alan gönderilmelidir.");
  });

  it("rejects update with blank name", () => {
    expect(() =>
      updateRoleSchema.parse({
        name: "   ",
      }),
    ).toThrow("Rol adı zorunludur.");
  });
});
