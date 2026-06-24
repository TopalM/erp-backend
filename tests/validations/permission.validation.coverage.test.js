import { describe, it, expect } from "vitest";

import {
  createPermissionSchema,
  updatePermissionSchema,
  updateUserPermissionsSchema,
} from "../../src/modules/auth/permissions/permission.validation.js";

describe("permission.validation coverage", () => {
  it("validates and trims create permission payload", () => {
    const result = createPermissionSchema.parse({
      code: " user.read ",
      name: " Kullanıcı Okuma ",
      description: " Açıklama ",
    });

    expect(result).toEqual({
      code: "user.read",
      name: "Kullanıcı Okuma",
      description: "Açıklama",
    });
  });

  it("allows nullable and missing description", () => {
    expect(
      createPermissionSchema.parse({
        code: "user.create",
        name: "User Create",
        description: null,
      }).description,
    ).toBeNull();

    expect(
      createPermissionSchema.parse({
        code: "user.update",
        name: "User Update",
      }).description,
    ).toBeUndefined();
  });

  it("rejects empty create fields", () => {
    expect(() =>
      createPermissionSchema.parse({
        code: "   ",
        name: "Permission",
      }),
    ).toThrow("Yetki kodu zorunludur.");

    expect(() =>
      createPermissionSchema.parse({
        code: "user.read",
        name: "   ",
      }),
    ).toThrow("Yetki adı zorunludur.");
  });

  it("allows partial update with one field", () => {
    const result = updatePermissionSchema.parse({
      description: " Updated ",
    });

    expect(result).toEqual({
      description: "Updated",
    });
  });

  it("rejects empty update body", () => {
    expect(() => updatePermissionSchema.parse({})).toThrow("Güncellenecek en az bir alan gönderilmelidir.");
  });

  it("defaults user permissions to empty array", () => {
    const result = updateUserPermissionsSchema.parse({});

    expect(result).toEqual({
      permissions: [],
    });
  });

  it("validates ALLOW and DENY user permissions", () => {
    const result = updateUserPermissionsSchema.parse({
      permissions: [
        {
          permissionId: "cmqr61vva000468kw2aigls1v",
          effect: "ALLOW",
        },
        {
          permissionId: "cmqr61vva000568kw2aigls1w",
          effect: "DENY",
        },
      ],
    });

    expect(result.permissions).toHaveLength(2);
  });

  it("rejects invalid permission id and effect", () => {
    expect(() =>
      updateUserPermissionsSchema.parse({
        permissions: [
          {
            permissionId: "not-cuid",
            effect: "ALLOW",
          },
        ],
      }),
    ).toThrow("Geçerli yetki id zorunludur.");

    expect(() =>
      updateUserPermissionsSchema.parse({
        permissions: [
          {
            permissionId: "cmqr61vva000468kw2aigls1v",
            effect: "INVALID",
          },
        ],
      }),
    ).toThrow();
  });
});
