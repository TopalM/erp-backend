import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => {
  const model = () => ({
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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
  Object.values(prismaMock).forEach(resetModel);

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: prismaMock,
  }));

  service = await import("../../src/modules/lookups/lookup.service.js");
});

const resetModel = (model) => {
  model.findFirst.mockResolvedValue(null);
  model.findUnique.mockResolvedValue({ id: 1 });
  model.count.mockResolvedValue(0);
  model.findMany.mockResolvedValue([]);
  model.create.mockImplementation(async ({ data }) => ({ id: data.id ?? "created-id", ...data }));
  model.update.mockImplementation(async ({ data, where }) => ({ id: where.id, ...data }));
  model.delete.mockResolvedValue({ id: "deleted-id" });
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.values(prismaMock).forEach(resetModel);
});

describe("lookup.service coverage", () => {
  it("lists lookup groups", async () => {
    const result = await service.getLookupGroupsService();

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((item) => item.key === "departments")).toBe(true);
    expect(result[0]).toHaveProperty("editable");
  });

  it("throws for invalid lookup group", async () => {
    await expect(service.getLookupGroupItemsService("missingGroup")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("lists items with filters, pagination and activeOnly default", async () => {
    prismaMock.bloodType.count.mockResolvedValue(1);
    prismaMock.bloodType.findMany.mockResolvedValue([
      {
        id: 1,
        name: "A RH+",
        isActive: true,
        createdAt: null,
        updatedAt: null,
      },
    ]);

    const result = await service.getBloodTypes({
      search: "A",
      page: "2",
      limit: "10",
    });

    expect(prismaMock.bloodType.count).toHaveBeenCalledWith({
      where: {
        isActive: true,
        name: {
          contains: "A",
          mode: "insensitive",
        },
      },
    });

    expect(prismaMock.bloodType.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );

    expect(result.rows[0]).toMatchObject({
      id: 1,
      value: "A RH+",
      label: "A RH+",
      isActive: true,
    });
  });

  it("does not apply active filter when activeOnly is false", async () => {
    await service.getBloodTypes({ activeOnly: "false" });

    expect(prismaMock.bloodType.count).toHaveBeenCalledWith({
      where: undefined,
    });
  });

  it("filters countryId, cityId and scope", async () => {
    await service.getSubRegions({ countryId: "1" });
    await service.getDistricts({ cityId: "34" });
    await service.getPaymentTerms({});

    expect(prismaMock.subRegion.count).toHaveBeenCalledWith({
      where: {
        isActive: true,
        countryId: 1,
      },
    });

    expect(prismaMock.district.count).toHaveBeenCalledWith({
      where: {
        cityId: 34,
      },
    });

    expect(prismaMock.paymentTerm.count).toHaveBeenCalledWith({
      where: {
        isActive: true,
        scope: "GENERAL",
      },
    });
  });

  it("forces raw material payment term scope", async () => {
    await service.getRawMaterialPaymentTerms({ scope: "GENERAL" });

    expect(prismaMock.paymentTerm.count).toHaveBeenCalledWith({
      where: {
        isActive: true,
        scope: "RAW_MATERIAL",
      },
    });
  });

  it("creates string id lookup item", async () => {
    prismaMock.department.create.mockResolvedValue({
      id: "dep1",
      code: "IT",
      name: "Bilgi İşlem",
      createdAt: null,
      updatedAt: null,
    });

    const result = await service.createLookupGroupItemService("departments", {
      value: "IT",
      extra: {
        name: "Bilgi İşlem",
      },
    });

    expect(prismaMock.department.create).toHaveBeenCalledWith({
      data: {
        code: "IT",
        name: "Bilgi İşlem",
      },
    });

    expect(result).toMatchObject({
      id: "dep1",
      value: "IT",
      label: "Bilgi İşlem",
      isActive: true,
    });
  });

  it("creates number id lookup item with numeric and active fields", async () => {
    prismaMock.productionReactor.findFirst.mockResolvedValue({ id: 5 });
    prismaMock.productionReactor.create.mockResolvedValue({
      id: 6,
      code: "R1",
      name: "Reaktör 1",
      sortOrder: 10,
      isActive: true,
    });

    const result = await service.createLookupGroupItemService("productionReactors", {
      value: "R1",
      extra: {
        name: "Reaktör 1",
        sortOrder: "10",
      },
      isActive: true,
    });

    expect(prismaMock.productionReactor.create).toHaveBeenCalledWith({
      data: {
        id: 6,
        code: "R1",
        name: "Reaktör 1",
        sortOrder: 10,
        isActive: true,
      },
    });

    expect(result.extra.sortOrder).toBe(10);
  });

  it("throws when value is empty", async () => {
    await expect(
      service.createLookupGroupItemService("bloodTypes", {
        value: "   ",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws when required extra field is missing", async () => {
    await expect(
      service.createLookupGroupItemService("productionReactors", {
        value: "R1",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("updates lookup item", async () => {
    prismaMock.productionReactor.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.productionReactor.update.mockResolvedValue({
      id: 1,
      code: "R2",
      name: "Reaktör 2",
      sortOrder: 20,
      isActive: false,
    });

    const result = await service.updateLookupGroupItemService("productionReactors", "1", {
      value: "R2",
      extra: {
        name: "Reaktör 2",
        sortOrder: "20",
      },
      isActive: false,
    });

    expect(prismaMock.productionReactor.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        code: "R2",
        name: "Reaktör 2",
        sortOrder: 20,
        isActive: false,
      },
    });

    expect(result.isActive).toBe(false);
  });

  it("throws when updating missing lookup item", async () => {
    prismaMock.bloodType.findUnique.mockResolvedValue(null);

    await expect(
      service.updateLookupGroupItemService("bloodTypes", "1", {
        value: "A RH+",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("soft deletes lookup item when activeField exists", async () => {
    await service.deleteLookupGroupItemService("bloodTypes", "1");

    expect(prismaMock.bloodType.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        isActive: false,
      },
    });

    expect(prismaMock.bloodType.delete).not.toHaveBeenCalled();
  });

  it("hard deletes lookup item when activeField does not exist", async () => {
    await service.deleteLookupGroupItemService("departments", "dep1");

    expect(prismaMock.department.delete).toHaveBeenCalledWith({
      where: { id: "dep1" },
    });
  });

  it("gets all lookups for non-large groups", async () => {
    const result = await service.getAllLookups();

    expect(result.groups.length).toBeGreaterThan(0);
    expect(result.departments).toBeTruthy();
    expect(result.countries).toBeUndefined();
  });
});
