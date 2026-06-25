import { describe, it, expect } from "vitest";

import { getProductionYears, getCurrencies } from "../../src/modules/lookups/lookup.service.js";

describe("lookup search security", () => {
  it("handles numeric lookup search safely", async () => {
    const res = await getProductionYears({
      search: "2026",
    });

    expect(res).toHaveProperty("rows");
    expect(res).toHaveProperty("pagination");
  });

  it("handles invalid numeric lookup search without Prisma string operator error", async () => {
    const res = await getProductionYears({
      search: "not-a-number",
    });

    expect(res.rows).toEqual([]);
    expect(res.pagination.total).toBe(0);
  });

  it("keeps string lookup search working", async () => {
    const res = await getCurrencies({
      search: "TL",
      activeOnly: "false",
    });

    expect(res).toHaveProperty("rows");
    expect(res).toHaveProperty("pagination");
  });
});
