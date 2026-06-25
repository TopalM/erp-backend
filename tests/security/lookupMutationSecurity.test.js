import { describe, it, expect } from "vitest";

import {
  createLookupGroupItemService,
  updateLookupGroupItemService,
  deleteLookupGroupItemService,
} from "../../src/modules/lookups/lookup.service.js";

describe("lookup mutation security", () => {
  it("rejects invalid numeric field on create", async () => {
    await expect(
      createLookupGroupItemService("productionYears", {
        value: "not-a-year",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "year sayısal olmalıdır.",
    });
  });

  it("rejects invalid boolean field on create", async () => {
    await expect(
      createLookupGroupItemService("bloodTypes", {
        value: "A+",
        isActive: "maybe",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "isActive geçersiz.",
    });
  });

  it("rejects invalid numeric id on update", async () => {
    await expect(
      updateLookupGroupItemService("bloodTypes", "abc", {
        value: "A+",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Lookup id geçersiz.",
    });
  });

  it("rejects invalid numeric id on delete", async () => {
    await expect(deleteLookupGroupItemService("bloodTypes", "abc")).rejects.toMatchObject({
      statusCode: 400,
      message: "Lookup id geçersiz.",
    });
  });

  it("rejects invalid relation id format", async () => {
    await expect(
      createLookupGroupItemService("cities", {
        value: "Test City",
        extra: {
          countryId: "abc",
        },
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "countryId sayısal olmalıdır.",
    });
  });
});
