import { describe, it, expect } from "vitest";

import { lookupItemSchema } from "../../src/modules/lookups/lookup.validation.js";

describe("lookup validation schema", () => {
  it("accepts valid lookup item", () => {
    const result = lookupItemSchema.safeParse({
      value: "Test",
      label: "Test Label",
      extra: {
        countryId: 1,
      },
      isActive: true,
    });

    expect(result.success).toBe(true);
  });

  it("defaults extra to empty object", () => {
    const result = lookupItemSchema.safeParse({
      value: "Test",
    });

    expect(result.success).toBe(true);
    expect(result.data.extra).toEqual({});
  });

  it("rejects empty value", () => {
    const result = lookupItemSchema.safeParse({
      value: "",
    });

    expect(result.success).toBe(false);
  });

  it("allows nullable label", () => {
    const result = lookupItemSchema.safeParse({
      value: "Test",
      label: null,
    });

    expect(result.success).toBe(true);
  });
});
