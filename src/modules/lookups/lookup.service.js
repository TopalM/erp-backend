import { prisma } from "../../database/prisma.client.js";

// Servis içinde kontrollü hata üretir.
// Express error middleware tarafından yakalanır.
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// İlgili model için sıradaki legacyId değerini üretir.
// legacyId alanı olmayan modellerde null döner.
const getNextLegacyId = async (config) => {
  if (config.hasLegacyId === false) return null;

  const result = await prisma[config.model].aggregate({
    _max: {
      legacyId: true,
    },
  });

  return Number(result?._max?.legacyId || 0) + 1;
};

// Numeric id kullanan master tablolarda yeni kayıt için sıradaki id değerini üretir.
// Country, City, District gibi eski numeric id kullanan tablolarda kullanılır.
const getNextNumberId = async (model) => {
  const last = await prisma[model].findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  return Number(last?.id || 0) + 1;
};

// Sistemde kullanılan tüm bağımsız lookup grupları.
const lookupGroups = {
  departments: {
    name: "Departmanlar",
    model: "department",
    idType: "string",
    valueField: "code",
    labelField: "name",
    extraFields: ["name"],
    requiredExtraFields: ["name"],
    orderBy: { name: "asc" },
    hasLegacyId: false,
  },

  productionReactors: {
    name: "Reaktörler",
    model: "productionReactor",
    idType: "string",
    valueField: "code",
    labelField: "name",
    extraFields: ["name", "sortOrder"],
    requiredExtraFields: ["name"],
    activeField: "isActive",
    orderBy: { sortOrder: "asc" },
    hasLegacyId: false,
  },

  bloodTypes: {
    name: "Kan Grupları",
    model: "bloodType",
    idType: "string",
    valueField: "name",
    labelField: "name",
    activeField: "isActive",
    orderBy: { name: "asc" },
  },

 countries: {
  name: "Ülkeler",
  model: "country",
  idType: "number",
  valueField: "value",
  labelField: "value",
  extraFields: ["iso2", "phoneCode"],
  orderBy: { value: "asc" },
  large: true,
},

  subRegions: {
    name: "Bölgeler",
    model: "subRegion",
    idType: "string",
    valueField: "name",
    labelField: "name",
    extraFields: ["countryId"],
    requiredExtraFields: ["countryId"],
    activeField: "isActive",
    orderBy: { name: "asc" },
  },

  cities: {
    name: "Şehirler",
    model: "city",
    idType: "number",
    valueField: "value",
    labelField: "value",
    extraFields: ["countryId"],
    requiredExtraFields: ["countryId"],
    orderBy: { value: "asc" },
    large: true,
  },

  districts: {
    name: "İlçeler",
    model: "district",
    idType: "number",
    valueField: "value",
    labelField: "value",
    extraFields: ["cityId"],
    requiredExtraFields: ["cityId"],
    orderBy: { value: "asc" },
    large: true,
  },

  taxOffices: {
    name: "Vergi Daireleri",
    model: "taxOffice",
    idType: "string",
    valueField: "name",
    labelField: "name",
    extraFields: ["cityId"],
    requiredExtraFields: ["cityId"],
    activeField: "isActive",
    orderBy: { name: "asc" },
    large: true,
  },

  currencies: {
    name: "Para Birimleri",
    model: "currency",
    idType: "string",
    valueField: "code",
    labelField: "name",
    activeField: "isActive",
    orderBy: { code: "asc" },
  },

  faultTypes: {
    name: "Arıza Türleri",
    model: "faultType",
    idType: "string",
    valueField: "name",
    labelField: "name",
    activeField: "isActive",
    orderBy: { name: "asc" },
  },

  locations: {
    name: "Lokasyonlar",
    model: "location",
    idType: "string",
    valueField: "name",
    labelField: "name",
    activeField: "isActive",
    orderBy: { name: "asc" },
  },

  machineTypes: {
    name: "Makine Türleri",
    model: "machineType",
    idType: "string",
    valueField: "name",
    labelField: "name",
    activeField: "isActive",
    orderBy: { name: "asc" },
  },

  paymentTerms: {
    name: "Ödeme Vadeleri",
    model: "paymentTerm",
    idType: "string",
    valueField: "code",
    labelField: "name",
    extraFields: ["scope", "days", "requiresDay"],
    activeField: "isActive",
    orderBy: { name: "asc" },
  },

  rawMaterialPaymentTerms: {
    name: "Hammadde Ödeme Vadeleri",
    model: "paymentTermRawMaterial",
    idType: "string",
    valueField: "code",
    labelField: "name",
    extraFields: ["scope", "days", "requiresDay"],
    activeField: "isActive",
    orderBy: { name: "asc" },
  },

  placesOfUse: {
    name: "Kullanım Yerleri",
    model: "placeOfUse",
    idType: "string",
    valueField: "name",
    labelField: "name",
    activeField: "isActive",
    orderBy: { name: "asc" },
  },

  productionYears: {
    name: "Üretim Yılları",
    model: "productionYear",
    idType: "string",
    valueField: "year",
    labelField: "year",
    activeField: "isActive",
    orderBy: { year: "asc" },
  },

  purchasedTypes: {
    name: "Satın Alınanlar",
    model: "purchased",
    idType: "string",
    valueField: "name",
    labelField: "name",
    activeField: "isActive",
    orderBy: { name: "asc" },
  },

 purchaseReasons: {
  name: "Satınalma Nedenleri",
  model: "purchaseReason",
  idType: "string",
  valueField: "name",
  labelField: "name",
  activeField: "isActive",
  orderBy: { name: "asc" },
},

  reasonFailures: {
    name: "Arıza Nedenleri",
    model: "reasonFailure",
    idType: "string",
    valueField: "name",
    labelField: "name",
    activeField: "isActive",
    orderBy: { name: "asc" },
  },

  supplierPoints: {
    name: "Tedarikçi Puanları",
    model: "supplierPoint",
    idType: "string",
    valueField: "value",
    labelField: "label",
    activeField: "isActive",
    orderBy: { value: "asc" },
  },

  tankFarms: {
    name: "Tank Sahaları",
    model: "tankFarm",
    idType: "string",
    valueField: "name",
    labelField: "name",
    activeField: "isActive",
    orderBy: { name: "asc" },
  },

  taxRatios: {
    name: "Vergi Oranları",
    model: "taxRatio",
    idType: "string",
    valueField: "name",
    labelField: "name",
    activeField: "isActive",
    orderBy: { name: "asc" },
  },

  transports: {
    name: "Nakliye Türleri",
    model: "transportType",
    idType: "string",
    valueField: "name",
    labelField: "name",
    activeField: "isActive",
    orderBy: { name: "asc" },
  },
};

// Verilen groupKey değerine ait lookup config bilgisini döndürür.
const getConfig = (groupKey) => {
  const config = lookupGroups[groupKey];

  if (!config) {
    throw createError("Geçersiz lookup grubu.", 404);
  }

  if (!prisma[config.model]) {
    throw createError(`Prisma modeli bulunamadı: ${config.model}`, 500);
  }

  return config;
};

// Numeric id kullanan lookup modellerinde id değerini Number'a çevirir.
const parseId = (config, id) => {
  if (config.idType === "number") return Number(id);
  return id;
};

// Frontend'den gelen payload içindeki extra alanlarını okur.
const getPayloadValue = (payload, field) => {
  if (payload?.extra && Object.prototype.hasOwnProperty.call(payload.extra, field)) {
    return payload.extra[field];
  }

  return payload?.[field];
};

// Numeric tutulması gereken alanları Number tipine çevirir.
const castValue = (field, value) => {
  if (value === undefined || value === null || value === "") return undefined;

if (["countryId", "cityId", "sortOrder", "days", "year"].includes(field)) {
  return Number(value);
}

  if (["requiresDay", "isActive"].includes(field)) {
    return Boolean(value);
  }

  return value;
};

// Prisma modelinden gelen kaydı frontend'in beklediği ortak lookup formatına çevirir.
const normalizeRow = (groupKey, config, row) => {
  const extra = {};

  for (const field of config.extraFields || []) {
    extra[field] = row[field] ?? null;
  }

  const isActive = config.activeField ? Boolean(row[config.activeField]) : config.deletedAtField ? !row[config.deletedAtField] : true;

  return {
    id: row.id,
    _id: row.id,
    groupKey,
    source: "master",
    type: groupKey,
    value: row[config.valueField],
    label: row[config.labelField] || row[config.valueField],
    legacyId: config.hasLegacyId === false ? null : (row.legacyId ?? null),
    extra,
    isActive,
    createdAt: row.createdAt || null,
    updatedAt: row.updatedAt || null,
  };
};

// Create/update işlemleri için Prisma data objesini hazırlar.
const buildData = (config, payload, isCreate = false) => {
  const value = payload.value?.toString().trim();

  if (!value) {
    throw createError("Değer zorunludur.");
  }

  const data = {
    [config.valueField]: castValue(config.valueField, value),
  };

  if (config.labelField && config.labelField !== config.valueField) {
    data[config.labelField] = payload.label?.toString().trim() || value;
  }

  for (const field of config.extraFields || []) {
    const valueFromPayload = getPayloadValue(payload, field);
    const castedValue = castValue(field, valueFromPayload);

    if (castedValue !== undefined) {
      data[field] = castedValue;
    }
  }

  for (const field of config.requiredExtraFields || []) {
    if (isCreate && (data[field] === undefined || data[field] === null || data[field] === "")) {
      throw createError(`${field} alanı zorunludur.`);
    }
  }

  if (config.activeField) {
    data[config.activeField] = payload.isActive ?? true;
  }

  return data;
};

// Güncellenecek veya silinecek kaydın varlığını kontrol eder.
const findRecordOrFail = async (config, id) => {
  const record = await prisma[config.model].findUnique({
    where: { id: parseId(config, id) },
    select: { id: true },
  });

  if (!record) {
    throw createError("Lookup kaydı bulunamadı.", 404);
  }

  return record;
};

// Belirli lookup grubunun kayıtlarını getirir.
const getItemsByGroup = async (groupKey, query = {}) => {
  const config = getConfig(groupKey);

  const page = Math.max(Number(query.page || 1), 1);

  const defaultLimit = config.large ? 50 : 100;
  const maxLimit = config.large ? 200 : 500;
  const limit = Math.min(Math.max(Number(query.limit || defaultLimit), 1), maxLimit);

  const skip = (page - 1) * limit;

  const where = {};

  if (config.activeField && query.activeOnly !== "false") {
    where[config.activeField] = true;
  }

  if (query.countryId && (config.extraFields || []).includes("countryId")) {
    where.countryId = Number(query.countryId);
  }

if (query.cityId && (config.extraFields || []).includes("cityId")) {
  where.cityId = Number(query.cityId);
}

if (query.scope && (config.extraFields || []).includes("scope")) {
  where.scope = query.scope;
}

if (query.search?.trim()) {
  where[config.labelField] = {
    contains: query.search.trim(),
    mode: "insensitive",
  };
}

  if (query.search?.trim()) {
    where[config.labelField] = {
      contains: query.search.trim(),
      mode: "insensitive",
    };
  }

  const [total, rows] = await Promise.all([
    prisma[config.model].count({
      where: Object.keys(where).length ? where : undefined,
    }),
    prisma[config.model].findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: config.orderBy,
      skip,
      take: limit,
    }),
  ]);

  return {
    rows: rows.map((row) => normalizeRow(groupKey, config, row)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lookup Yönetimi ekranında gösterilecek tüm grupları döndürür.
export const getLookupGroupsService = async () => {
  return Object.entries(lookupGroups)
    .filter(([, config]) => Boolean(prisma[config.model]))
    .map(([key, config]) => ({
      key,
      name: config.name,
      editable: config.editable !== false,
      source: "master",
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
};

// Belirli bir lookup grubunun kayıtlarını döndürür.
export const getLookupGroupItemsService = async (groupKey, query = {}) => {
  return getItemsByGroup(groupKey, query);
};

// Yeni lookup kaydı oluşturur.
export const createLookupGroupItemService = async (groupKey, payload) => {
  const config = getConfig(groupKey);

  if (config.editable === false) {
    throw createError("Bu lookup grubu düzenlenemez.", 403);
  }

  const data = buildData(config, payload, true);

  if (config.idType === "number") {
    data.id = await getNextNumberId(config.model);
  }

  if (config.hasLegacyId !== false) {
    data.legacyId = await getNextLegacyId(config);
  }

  const row = await prisma[config.model].create({ data });

  return normalizeRow(groupKey, config, row);
};

// Mevcut lookup kaydını günceller.
export const updateLookupGroupItemService = async (groupKey, id, payload) => {
  const config = getConfig(groupKey);

  if (config.editable === false) {
    throw createError("Bu lookup grubu düzenlenemez.", 403);
  }

  await findRecordOrFail(config, id);

  const data = buildData(config, payload, false);

  const row = await prisma[config.model].update({
    where: { id: parseId(config, id) },
    data,
  });

  return normalizeRow(groupKey, config, row);
};

// Lookup kaydını siler veya pasife alır.
export const deleteLookupGroupItemService = async (groupKey, id) => {
  const config = getConfig(groupKey);

  if (config.editable === false) {
    throw createError("Bu lookup grubu düzenlenemez.", 403);
  }

  await findRecordOrFail(config, id);

  if (config.activeField) {
    await prisma[config.model].update({
      where: { id: parseId(config, id) },
      data: { [config.activeField]: false },
    });

    return null;
  }

  if (config.deletedAtField) {
    await prisma[config.model].update({
      where: { id: parseId(config, id) },
      data: { [config.deletedAtField]: new Date() },
    });

    return null;
  }

  await prisma[config.model].delete({
    where: { id: parseId(config, id) },
  });

  return null;
};

// Tüm lookup gruplarını ve küçük lookup kayıtlarını tek response içinde döndürür.
// large: true olan grupların kayıtları burada dönmez.
export const getAllLookups = async () => {
  const groups = await getLookupGroupsService();

  const smallGroups = groups.filter((group) => {
    const config = lookupGroups[group.key];
    return !config?.large;
  });

  const entries = await Promise.all(
    smallGroups.map(async (group) => {
      const items = await getLookupGroupItemsService(group.key, {
        activeOnly: "false",
      });

      return [group.key, items];
    }),
  );

  return {
    groups,
    ...Object.fromEntries(entries),
  };
};

export const getDepartments = (query) => getItemsByGroup("departments", query);
export const getProductionReactors = (query) => getItemsByGroup("productionReactors", query);

export const getBloodTypes = (query) => getItemsByGroup("bloodTypes", query);
export const getCountries = (query) => getItemsByGroup("countries", query);
export const getSubRegions = (query) => getItemsByGroup("subRegions", query);
export const getCities = (query) => getItemsByGroup("cities", query);
export const getDistricts = (query) => getItemsByGroup("districts", query);
export const getTaxOffices = (query) => getItemsByGroup("taxOffices", query);

export const getCurrencies = (query) => getItemsByGroup("currencies", query);
export const getFaultTypes = (query) => getItemsByGroup("faultTypes", query);
export const getLocations = (query) => getItemsByGroup("locations", query);
export const getMachineTypes = (query) => getItemsByGroup("machineTypes", query);
export const getPaymentTerms = (query) => getItemsByGroup("paymentTerms", query);
export const getRawMaterialPaymentTerms = (query) => getItemsByGroup("rawMaterialPaymentTerms", query);
export const getPlacesOfUse = (query) => getItemsByGroup("placesOfUse", query);
export const getProductionYears = (query) => getItemsByGroup("productionYears", query);
export const getPurchasedTypes = (query) => getItemsByGroup("purchasedTypes", query);
export const getPurchaseReasons = (query) => getItemsByGroup("purchaseReasons", query);
export const getReasonFailures = (query) => getItemsByGroup("reasonFailures", query);
export const getSupplierPoints = (query) => getItemsByGroup("supplierPoints", query);
export const getTankFarms = (query) => getItemsByGroup("tankFarms", query);
export const getTaxRatios = (query) => getItemsByGroup("taxRatios", query);
export const getTransports = (query) => getItemsByGroup("transports", query);
