import { describe, it, expect } from "vitest";
import { prisma } from "../../src/database/prisma.client.js";

describe("Lookup seed data", () => {
  it("has core lookup data", async () => {
    const [countries, cities, currencies, paymentTerms, reactors] = await Promise.all([
      prisma.country.count(),
      prisma.city.count(),
      prisma.currency.count(),
      prisma.paymentTerm.count(),
      prisma.productionReactor.count(),
    ]);

    expect(countries).toBeGreaterThan(0);
    expect(cities).toBeGreaterThan(0);
    expect(currencies).toBeGreaterThan(0);
    expect(paymentTerms).toBeGreaterThan(0);
    expect(reactors).toBeGreaterThan(0);
  });

  it("has quality lookup data", async () => {
    const [appearances, categories, types, parameters] = await Promise.all([
      prisma.qualityAppearance.count(),
      prisma.rawMaterialCategory.count(),
      prisma.rawMaterialType.count(),
      prisma.rawMaterialAnalysisParameter.count(),
    ]);

    expect(appearances).toBeGreaterThan(0);
    expect(categories).toBeGreaterThan(0);
    expect(types).toBeGreaterThan(0);
    expect(parameters).toBeGreaterThan(0);
  });
});
