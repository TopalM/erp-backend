import { describe, it, expect, vi, beforeEach } from "vitest";

const serviceMocks = vi.hoisted(() => ({
  getAllLookups: vi.fn(),
  getLookupGroupsService: vi.fn(),
  getLookupGroupItemsService: vi.fn(),
  createLookupGroupItemService: vi.fn(),
  updateLookupGroupItemService: vi.fn(),
  deleteLookupGroupItemService: vi.fn(),

  getDepartments: vi.fn(),
  getProductionReactors: vi.fn(),
  getBloodTypes: vi.fn(),
  getCountries: vi.fn(),
  getSubRegions: vi.fn(),
  getCities: vi.fn(),
  getDistricts: vi.fn(),
  getTaxOffices: vi.fn(),
  getCurrencies: vi.fn(),
  getFaultTypes: vi.fn(),
  getLocations: vi.fn(),
  getMachineTypes: vi.fn(),
  getPaymentTerms: vi.fn(),
  getRawMaterialPaymentTerms: vi.fn(),
  getPlacesOfUse: vi.fn(),
  getProductionYears: vi.fn(),
  getPurchasedTypes: vi.fn(),
  getPurchaseReasons: vi.fn(),
  getReasonFailures: vi.fn(),
  getSupplierPoints: vi.fn(),
  getTankFarms: vi.fn(),
  getTaxRatios: vi.fn(),
  getTransports: vi.fn(),
}));

let controller;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  Object.values(serviceMocks).forEach((mockFn) => {
    mockFn.mockResolvedValue(rowsResponse);
  });

  vi.doMock("../../src/modules/lookups/lookup.service.js", () => ({
    ...serviceMocks,
  }));

  controller = await import("../../src/modules/lookups/lookup.controller.js");
});

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const rowsResponse = {
  rows: [{ id: 1, value: "A", label: "A" }],
  pagination: {
    page: 1,
    limit: 100,
    total: 1,
    totalPages: 1,
  },
};

describe("lookup.controller coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.values(serviceMocks).forEach((mockFn) => {
      mockFn.mockResolvedValue(rowsResponse);
    });
  });

  it("gets all lookups", async () => {
    serviceMocks.getAllLookups.mockResolvedValue({ groups: [] });

    const req = {};
    const res = makeRes();
    const next = vi.fn();

    await controller.getAllLookups(req, res, next);

    expect(serviceMocks.getAllLookups).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("gets lookup groups", async () => {
    serviceMocks.getLookupGroupsService.mockResolvedValue([{ key: "bloodTypes" }]);

    const req = {};
    const res = makeRes();
    const next = vi.fn();

    await controller.getLookupGroups(req, res, next);

    expect(serviceMocks.getLookupGroupsService).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("gets lookup group items", async () => {
    const req = {
      params: { groupKey: "bloodTypes" },
      query: { search: "A" },
    };
    const res = makeRes();
    const next = vi.fn();

    await controller.getLookupGroupItems(req, res, next);

    expect(serviceMocks.getLookupGroupItemsService).toHaveBeenCalledWith("bloodTypes", req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("creates lookup group item", async () => {
    const req = {
      params: { groupKey: "bloodTypes" },
      body: { value: "A RH+" },
    };
    const res = makeRes();
    const next = vi.fn();

    await controller.createLookupGroupItem(req, res, next);

    expect(serviceMocks.createLookupGroupItemService).toHaveBeenCalledWith("bloodTypes", req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("updates lookup group item", async () => {
    const req = {
      params: { groupKey: "bloodTypes", id: "1" },
      body: { value: "B RH+" },
    };
    const res = makeRes();
    const next = vi.fn();

    await controller.updateLookupGroupItem(req, res, next);

    expect(serviceMocks.updateLookupGroupItemService).toHaveBeenCalledWith("bloodTypes", "1", req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("deletes lookup group item", async () => {
    const req = {
      params: { groupKey: "bloodTypes", id: "1" },
    };
    const res = makeRes();
    const next = vi.fn();

    await controller.deleteLookupGroupItem(req, res, next);

    expect(serviceMocks.deleteLookupGroupItemService).toHaveBeenCalledWith("bloodTypes", "1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("calls simple lookup getter with query", async () => {
    const req = {
      query: { activeOnly: "false" },
    };
    const res = makeRes();
    const next = vi.fn();

    await controller.getCurrencies(req, res, next);

    expect(serviceMocks.getCurrencies).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
