import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const prismaMock = vi.hoisted(() => {
  const model = () => ({
    count: vi.fn().mockResolvedValue(0),
    findMany: vi.fn().mockResolvedValue([]),
  });

  return {
    department: model(),
    productionReactor: model(),
    bloodType: model(),
    country: model(),
    subRegion: model(),
    city: model(),
    district: model(),
    taxOffice: model(),
    currency: model(),
    faultType: model(),
    location: model(),
    machineType: model(),
    paymentTerm: model(),
    placeOfUse: model(),
    productionYear: model(),
    purchased: model(),
    purchaseReason: model(),
    failureReason: model(),
    supplierPoint: model(),
    tankFarm: model(),
    taxRatio: model(),
    transportType: model(),
  };
});

let service;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: prismaMock,
  }));

  service = await import("../../src/modules/lookups/lookup.service.js");
});

afterEach(() => {
  vi.doUnmock("../../src/database/prisma.client.js");
  vi.resetModules();
});

describe("lookup getter coverage", () => {
  it("calls all simple lookup getters", async () => {
    await service.getDepartments();
    await service.getProductionReactors();
    await service.getBloodTypes();
    await service.getCountries();
    await service.getSubRegions();
    await service.getCities();
    await service.getDistricts();
    await service.getTaxOffices();
    await service.getCurrencies();
    await service.getFaultTypes();
    await service.getLocations();
    await service.getMachineTypes();
    await service.getPlacesOfUse();
    await service.getProductionYears();
    await service.getPurchasedTypes();
    await service.getPurchaseReasons();
    await service.getReasonFailures();
    await service.getSupplierPoints();
    await service.getTankFarms();
    await service.getTaxRatios();
    await service.getTransports();

    expect(prismaMock.department.findMany).toHaveBeenCalled();
    expect(prismaMock.transportType.findMany).toHaveBeenCalled();
  });

  it("uses GENERAL scope as default for payment terms", async () => {
    await service.getPaymentTerms();

    expect(prismaMock.paymentTerm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          scope: "GENERAL",
        }),
      }),
    );
  });

  it("keeps explicit payment term scope", async () => {
    await service.getPaymentTerms({
      scope: "CUSTOM",
    });

    expect(prismaMock.paymentTerm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          scope: "CUSTOM",
        }),
      }),
    );
  });

  it("forces RAW_MATERIAL scope for raw material payment terms", async () => {
    await service.getRawMaterialPaymentTerms({
      scope: "GENERAL",
    });

    expect(prismaMock.paymentTerm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          scope: "RAW_MATERIAL",
        }),
      }),
    );
  });
});
