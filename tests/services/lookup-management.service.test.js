import { describe, it, expect } from "vitest";

import * as lookupService from "../../src/modules/lookups/lookup.service.js";

describe("lookup management service", () => {
  it("returns lookup groups", async () => {
    const result = await lookupService.getLookupGroupsService();

    expect(Array.isArray(result)).toBe(true);
  });

  it("returns all lookups", async () => {
    const result = await lookupService.getAllLookups();

    expect(result).toBeTruthy();
    expect(typeof result).toBe("object");
  });

  it("contains departments lookup", async () => {
    const result = await lookupService.getAllLookups();

    expect(result).toHaveProperty("departments");
  });

  it("contains currencies lookup", async () => {
    const result = await lookupService.getAllLookups();

    expect(result).toHaveProperty("currencies");
  });
});
