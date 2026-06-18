import * as lookupService from "./lookup.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";

// Lookup servis fonksiyonlarını standart controller yapısına dönüştürür.
// Böylece her bağımsız lookup endpointinde tekrar try/catch yazmaya gerek kalmaz.
const createLookupGetter = (serviceFn) =>
  asyncHandler(async (req, res) => {
    const data = await serviceFn(req.query);
    return successResponse(res, data);
  });

// Tüm lookup gruplarını ve küçük lookup kayıtlarını döndürür.
// Büyük tablolar, örneğin şehir/ilçe/vergi dairesi, burada kayıtlarıyla birlikte dönmez.
export const getAllLookups = asyncHandler(async (req, res) => {
  const data = await lookupService.getAllLookups();
  return successResponse(res, data);
});

// Tanımlı lookup gruplarını listeler.
export const getLookupGroups = asyncHandler(async (req, res) => {
  const data = await lookupService.getLookupGroupsService();
  return successResponse(res, data);
});

// Belirli bir lookup grubuna ait kayıtları sayfalı olarak listeler.
export const getLookupGroupItems = asyncHandler(async (req, res) => {
  const data = await lookupService.getLookupGroupItemsService(req.params.groupKey, req.query);
  return successResponse(res, data);
});

// Belirli bir lookup grubuna yeni kayıt ekler.
export const createLookupGroupItem = asyncHandler(async (req, res) => {
  const data = await lookupService.createLookupGroupItemService(req.params.groupKey, req.body);
  return successResponse(res, data, "Lookup kaydı oluşturuldu.", 201);
});

// Belirli bir lookup kaydını günceller.
export const updateLookupGroupItem = asyncHandler(async (req, res) => {
  const data = await lookupService.updateLookupGroupItemService(req.params.groupKey, req.params.id, req.body);
  return successResponse(res, data, "Lookup kaydı güncellendi.");
});

// Belirli bir lookup kaydını siler veya pasife alır.
export const deleteLookupGroupItem = asyncHandler(async (req, res) => {
  await lookupService.deleteLookupGroupItemService(req.params.groupKey, req.params.id);
  return successResponse(res, null, "Lookup kaydı silindi.");
});

// Bağımsız lookup endpointleri.
// Eski client uyumluluğu ve select/autocomplete alanları için kullanılır.
export const getDepartments = createLookupGetter(lookupService.getDepartments);
export const getProductionReactors = createLookupGetter(lookupService.getProductionReactors);

export const getBloodTypes = createLookupGetter(lookupService.getBloodTypes);
export const getCountries = createLookupGetter(lookupService.getCountries);
export const getSubRegions = createLookupGetter(lookupService.getSubRegions);

export const getDistricts = createLookupGetter(lookupService.getDistricts);
export const getTaxOffices = createLookupGetter(lookupService.getTaxOffices);
export const getCities = createLookupGetter(lookupService.getCities);
export const getCurrencies = createLookupGetter(lookupService.getCurrencies);
export const getFaultTypes = createLookupGetter(lookupService.getFaultTypes);
export const getLocations = createLookupGetter(lookupService.getLocations);
export const getMachineTypes = createLookupGetter(lookupService.getMachineTypes);
export const getPaymentTerms = createLookupGetter(lookupService.getPaymentTerms);
export const getRawMaterialPaymentTerms = createLookupGetter(lookupService.getRawMaterialPaymentTerms);
export const getPlacesOfUse = createLookupGetter(lookupService.getPlacesOfUse);
export const getProductionYears = createLookupGetter(lookupService.getProductionYears);
export const getPurchasedTypes = createLookupGetter(lookupService.getPurchasedTypes);
export const getPurchaseReasons = createLookupGetter(lookupService.getPurchaseReasons);
export const getReasonFailures = createLookupGetter(lookupService.getReasonFailures);
export const getSupplierPoints = createLookupGetter(lookupService.getSupplierPoints);
export const getTankFarms = createLookupGetter(lookupService.getTankFarms);
export const getTaxRatios = createLookupGetter(lookupService.getTaxRatios);
export const getTransports = createLookupGetter(lookupService.getTransports);
