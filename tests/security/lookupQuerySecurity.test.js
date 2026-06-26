import { describe, it, expect, vi } from "vitest";

vi.mock("../../src/database/prisma.client.js", () => ({
  prisma: {
    city: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    district: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    bloodType: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    paymentTerm: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

import { getCities, getDistricts, getPaymentTerms, getBloodTypes } from "../../src/modules/lookups/lookup.service.js";

describe("lookup query security", () => {
  it("rejects invalid countryId query", async () => {
    await expect(getCities({ countryId: "abc" })).rejects.toMatchObject({
      statusCode: 400,
      message: "countryId geçersiz.",
    });
  });

  it("rejects invalid cityId query", async () => {
    await expect(getDistricts({ cityId: "1 OR 1=1" })).rejects.toMatchObject({
      statusCode: 400,
      message: "cityId geçersiz.",
    });
  });

  it("caps excessive limit for large lookup groups", async () => {
    const result = await getCities({ limit: "999999" });
    expect(result.pagination.limit).toBeLessThanOrEqual(200);
  });

  it("caps excessive limit for normal lookup groups", async () => {
    const result = await getBloodTypes({ limit: "999999" });
    expect(result.pagination.limit).toBeLessThanOrEqual(500);
  });

  it("uses default page when page is invalid", async () => {
    const result = await getBloodTypes({ page: "-999" });
    expect(result.pagination.page).toBe(1);
  });

  it("defaults payment terms scope to GENERAL", async () => {
    const result = await getPaymentTerms({});

    expect(result).toHaveProperty("rows");
    expect(result).toHaveProperty("pagination");
  });
});
