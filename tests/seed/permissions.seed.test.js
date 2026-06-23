import { describe, it, expect } from "vitest";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { DEFAULT_PERMISSIONS } from "../../src/seed/data/Permissions.js";

describe("Permission seed consistency", () => {
  it("seeds every permission from constants", () => {
    const constantCodes = Object.values(PERMISSIONS).sort();
    const seedCodes = DEFAULT_PERMISSIONS.map((item) => item.code).sort();

    expect(seedCodes).toEqual(constantCodes);
  });

  it("does not contain old underscore manage permissions", () => {
    const seedCodes = DEFAULT_PERMISSIONS.map((item) => item.code);

    expect(seedCodes).not.toContain("user.permission_manage");
    expect(seedCodes).not.toContain("user.role_manage");
    expect(seedCodes).not.toContain("user.super_admin_manage");
  });
});
