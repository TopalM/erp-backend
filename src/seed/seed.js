import bcrypt from "bcryptjs";

import { prisma } from "../database/prisma.client.js";

import { DEFAULT_ROLE_LIST, ROLES } from "../constants/roles.js";

import { Departments } from "./data/Departments.js";
import { DEFAULT_PERMISSIONS } from "./data/Permissions.js";
import { ProductionReaktor } from "./data/ProductionReaktor.js";

import { BloodType } from "./data/Lookups/BloodType.js";
import { Cities } from "./data/Lookups/Cities.js";
import { Countries } from "./data/Lookups/Countries.js";
import { Currency } from "./data/Lookups/Currency.js";
import { Districts } from "./data/Lookups/Districts.js";
import { FaultType } from "./data/Lookups/FaultType.js";
import { Locations } from "./data/Lookups/Locations.js";
import { MachineType } from "./data/Lookups/MachineType.js";
import { paymentTerms } from "./data/Lookups/PaymentTerm.js";
import { PlaceOfUse } from "./data/Lookups/PlaceOfUse.js";
import { ProductionYear } from "./data/Lookups/ProductionYear.js";
import { PurchaseReeason } from "./data/Lookups/PurchaseReason.js";
import { Purchased } from "./data/Lookups/Purchased.js";
import { reasonFailure } from "./data/Lookups/ReasonFailure.js";
import { SubRegions } from "./data/Lookups/SubRegions.js";
import { SupplierPoint } from "./data/Lookups/SupplierPoint.js";
import { TankFarm } from "./data/Lookups/TankFarm.js";
import { TaxOffices } from "./data/Lookups/TaxOffices.js";
import { TaxRatio } from "./data/Lookups/TaxRatio.js";
import { Transport } from "./data/Lookups/Transport.js";
import { units } from "./data/Lookups/Units.js";

import { qualityAppearance } from "./data/Quality/Appearance.js";
import { inputControlAppearance } from "./data/Quality/InputControlAppearance.js";
import { rawMaterialAnalysis } from "./data/Quality/RawMaterialAnalysis.js";
import { rawMaterialCategory } from "./data/Quality/RawMaterialCategory.js";
import { rawMaterialType } from "./data/Quality/RawMaterialType.js";

const normalizeText = (value) => String(value ?? "").trim();

const normalizeNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const uniqueBy = (items, getKey) => {
  const map = new Map();

  for (const item of items ?? []) {
    const key = getKey(item);

    if (key === null || key === undefined || key === "") continue;

    map.set(String(key), item);
  }

  return [...map.values()];
};

const getSeedName = (item) => {
  return normalizeText(
    item.name ?? item.label ?? item.value ?? item.reasonPurchase ?? item.tankName ?? item.subregion ?? item.analysisName ?? item.option,
  );
};

const getPaymentTermId = (item) => {
  const legacyId = normalizeNumber(item.legacyId ?? item.id);

  if (legacyId === null) {
    throw new Error(`PaymentTerm id bulunamadı: ${JSON.stringify(item)}`);
  }

  return item.scope === "RAW_MATERIAL" ? 1000 + legacyId : legacyId;
};

const getRawMaterialAnalysisOptionId = ({ parameterId, optionId }) => {
  return parameterId * 1000 + optionId;
};

const seedCountries = async () => {
  console.log("Ülkeler yükleniyor...");

  for (const country of uniqueBy(Countries, (item) => item.id)) {
    await prisma.country.upsert({
      where: {
        id: Number(country.id),
      },
      update: {
        value: normalizeText(country.value),
        iso2: normalizeText(country.iso2),
        phoneCode: normalizeText(country.phoneCode),
      },
      create: {
        id: Number(country.id),
        value: normalizeText(country.value),
        iso2: normalizeText(country.iso2),
        phoneCode: normalizeText(country.phoneCode),
      },
    });
  }

  console.log("Ülkeler yüklendi.");
};

const seedCities = async () => {
  console.log("Şehirler yükleniyor...");

  for (const city of uniqueBy(Cities, (item) => item.id)) {
    await prisma.city.upsert({
      where: {
        id: Number(city.id),
      },
      update: {
        value: normalizeText(city.value),
        countryId: Number(city.countryId),
      },
      create: {
        id: Number(city.id),
        value: normalizeText(city.value),
        countryId: Number(city.countryId),
      },
    });
  }

  console.log("Şehirler yüklendi.");
};

const seedDistricts = async () => {
  console.log("İlçeler yükleniyor...");

  for (const district of uniqueBy(Districts, (item) => item.id)) {
    await prisma.district.upsert({
      where: {
        id: Number(district.id),
      },
      update: {
        value: normalizeText(district.value),
        cityId: Number(district.cityId),
      },
      create: {
        id: Number(district.id),
        value: normalizeText(district.value),
        cityId: Number(district.cityId),
      },
    });
  }

  console.log("İlçeler yüklendi.");
};

const seedSubRegions = async () => {
  console.log("Alt bölgeler yükleniyor...");

  for (const item of uniqueBy(SubRegions, (item) => item.id)) {
    const name = normalizeText(item.subregion ?? item.name ?? item.value);

    if (!name) continue;

    await prisma.subRegion.upsert({
      where: {
        id: Number(item.id),
      },
      update: {
        countryId: Number(item.countryId),
        name,
        isActive: true,
      },
      create: {
        id: Number(item.id),
        countryId: Number(item.countryId),
        name,
        isActive: true,
      },
    });
  }

  console.log("Alt bölgeler yüklendi.");
};

const seedTaxOffices = async () => {
  console.log("Vergi daireleri yükleniyor...");

  for (const item of uniqueBy(TaxOffices, (item) => item.id)) {
    const name = normalizeText(item.value ?? item.name);

    if (!name) continue;

    await prisma.taxOffice.upsert({
      where: {
        id: Number(item.id),
      },
      update: {
        cityId: Number(item.cityId),
        name,
        isActive: true,
      },
      create: {
        id: Number(item.id),
        cityId: Number(item.cityId),
        name,
        isActive: true,
      },
    });
  }

  console.log("Vergi daireleri yüklendi.");
};

const seedUnits = async () => {
  console.log("Birimler yükleniyor...");

  const uniqueUnits = uniqueBy(units, (item) => item.code);

  for (const [index, item] of uniqueUnits.entries()) {
    const id = Number(item.id ?? index + 1);

    await prisma.unit.upsert({
      where: {
        id,
      },
      update: {
        code: normalizeText(item.code),
        name: normalizeText(item.name),
        symbol: item.symbol ? normalizeText(item.symbol) : null,
        isActive: true,
      },
      create: {
        id,
        code: normalizeText(item.code),
        name: normalizeText(item.name),
        symbol: item.symbol ? normalizeText(item.symbol) : null,
        isActive: true,
      },
    });
  }

  console.log("Birimler yüklendi.");
};

const seedCurrencies = async () => {
  console.log("Para birimleri yükleniyor...");

  for (const item of uniqueBy(Currency, (item) => item.id)) {
    const code = normalizeText(item.code ?? item.value);
    const name = item.name ?? item.label;

    if (!code) continue;

    await prisma.currency.upsert({
      where: {
        id: Number(item.id),
      },
      update: {
        code,
        name: name ? normalizeText(name) : null,
        isActive: true,
      },
      create: {
        id: Number(item.id),
        code,
        name: name ? normalizeText(name) : null,
        isActive: true,
      },
    });
  }

  console.log("Para birimleri yüklendi.");
};

const seedTaxRatios = async () => {
  console.log("KDV oranları yükleniyor...");

  for (const item of uniqueBy(TaxRatio, (item) => item.id)) {
    const value = normalizeNumber(item.value);

    if (value === null) continue;

    await prisma.taxRatio.upsert({
      where: {
        id: Number(item.id),
      },
      update: {
        value,
        name: `%${value}`,
        isActive: true,
      },
      create: {
        id: Number(item.id),
        value,
        name: `%${value}`,
        isActive: true,
      },
    });
  }

  console.log("KDV oranları yüklendi.");
};

const seedPaymentTerms = async () => {
  console.log("Ödeme vadeleri yükleniyor...");

  for (const item of uniqueBy(paymentTerms, (item) => `${item.scope}-${item.legacyId ?? item.id}`)) {
    const id = getPaymentTermId(item);
    const name = normalizeText(item.name ?? item.value ?? item.label);

    if (!name) continue;

    await prisma.paymentTerm.upsert({
      where: {
        id,
      },
      update: {
        scope: item.scope,
        code: item.code ? normalizeText(item.code) : null,
        name,
        days: item.days === null || item.days === undefined ? null : Number(item.days),
        requiresDay: Boolean(item.requiresDay),
        isActive: true,
      },
      create: {
        id,
        scope: item.scope,
        code: item.code ? normalizeText(item.code) : null,
        name,
        days: item.days === null || item.days === undefined ? null : Number(item.days),
        requiresDay: Boolean(item.requiresDay),
        isActive: true,
      },
    });
  }

  console.log("Ödeme vadeleri yüklendi.");
};

const seedProductionYears = async () => {
  console.log("Üretim yılları yükleniyor...");

  for (const item of uniqueBy(ProductionYear, (item) => item.id)) {
    const year = normalizeNumber(item.year ?? item.value);

    if (year === null) continue;

    await prisma.productionYear.upsert({
      where: {
        id: Number(item.id),
      },
      update: {
        year,
        isActive: true,
      },
      create: {
        id: Number(item.id),
        year,
        isActive: true,
      },
    });
  }

  console.log("Üretim yılları yüklendi.");
};

const seedSupplierPoints = async () => {
  console.log("Tedarikçi puanları yükleniyor...");

  for (const item of uniqueBy(SupplierPoint, (item) => item.id)) {
    const value = normalizeNumber(item.value);

    if (value === null) continue;

    await prisma.supplierPoint.upsert({
      where: {
        id: Number(item.id),
      },
      update: {
        value,
        label: normalizeText(item.label ?? item.value),
        isActive: true,
      },
      create: {
        id: Number(item.id),
        value,
        label: normalizeText(item.label ?? item.value),
        isActive: true,
      },
    });
  }

  console.log("Tedarikçi puanları yüklendi.");
};

const seedNamedLookup = async ({ label, delegate, data }) => {
  console.log(`${label} yükleniyor...`);

  for (const item of uniqueBy(data, (item) => item.id)) {
    const name = getSeedName(item);

    if (!name) continue;

    await delegate.upsert({
      where: {
        id: Number(item.id),
      },
      update: {
        name,
        isActive: true,
      },
      create: {
        id: Number(item.id),
        name,
        isActive: true,
      },
    });
  }

  console.log(`${label} yüklendi.`);
};

const seedBloodTypes = async () => {
  await seedNamedLookup({
    label: "Kan grupları",
    delegate: prisma.bloodType,
    data: BloodType,
  });
};

const seedFaultTypes = async () => {
  await seedNamedLookup({
    label: "Arıza tipleri",
    delegate: prisma.faultType,
    data: FaultType,
  });
};

const seedLocations = async () => {
  await seedNamedLookup({
    label: "Lokasyonlar",
    delegate: prisma.location,
    data: Locations,
  });
};

const seedMachineTypes = async () => {
  await seedNamedLookup({
    label: "Makine tipleri",
    delegate: prisma.machineType,
    data: MachineType,
  });
};

const seedPlaceOfUses = async () => {
  await seedNamedLookup({
    label: "Kullanım yerleri",
    delegate: prisma.placeOfUse,
    data: PlaceOfUse,
  });
};

const seedPurchased = async () => {
  await seedNamedLookup({
    label: "Satınalma tipleri",
    delegate: prisma.purchased,
    data: Purchased,
  });
};

const seedPurchaseReasons = async () => {
  await seedNamedLookup({
    label: "Satınalma nedenleri",
    delegate: prisma.purchaseReason,
    data: PurchaseReeason,
  });
};

const seedFailureReasons = async () => {
  await seedNamedLookup({
    label: "Arıza nedenleri",
    delegate: prisma.failureReason,
    data: reasonFailure,
  });
};

const seedTankFarms = async () => {
  await seedNamedLookup({
    label: "Tank çiftliği verileri",
    delegate: prisma.tankFarm,
    data: TankFarm,
  });
};

const seedTransportTypes = async () => {
  await seedNamedLookup({
    label: "Taşıma tipleri",
    delegate: prisma.transportType,
    data: Transport,
  });
};

const seedQualityAppearances = async () => {
  await seedNamedLookup({
    label: "Kalite görünüşleri",
    delegate: prisma.qualityAppearance,
    data: qualityAppearance,
  });
};

const seedInputControlAppearances = async () => {
  await seedNamedLookup({
    label: "Girdi kontrol görünüşleri",
    delegate: prisma.inputControlAppearance,
    data: inputControlAppearance,
  });
};

const seedRawMaterialCategories = async () => {
  await seedNamedLookup({
    label: "Hammadde kategorileri",
    delegate: prisma.rawMaterialCategory,
    data: rawMaterialCategory,
  });
};

const seedRawMaterialTypes = async () => {
  await seedNamedLookup({
    label: "Hammadde tipleri",
    delegate: prisma.rawMaterialType,
    data: rawMaterialType,
  });
};

const seedRawMaterialAnalysisParameters = async () => {
  console.log("Hammadde analiz parametreleri yükleniyor...");

  for (const item of uniqueBy(rawMaterialAnalysis, (item) => item.id)) {
    await prisma.rawMaterialAnalysisParameter.upsert({
      where: {
        id: Number(item.id),
      },
      update: {
        name: normalizeText(item.analysisName ?? item.name),
        fieldKey: normalizeText(item.fieldKey),
        unit: item.unit === undefined ? null : normalizeText(item.unit),
        cleaned: Boolean(item.cleaned),
        customSelect: Boolean(item.customSelect),
        lengthValue: item.lengthValue === null || item.lengthValue === undefined ? null : Number(item.lengthValue),
        isActive: true,
      },
      create: {
        id: Number(item.id),
        name: normalizeText(item.analysisName ?? item.name),
        fieldKey: normalizeText(item.fieldKey),
        unit: item.unit === undefined ? null : normalizeText(item.unit),
        cleaned: Boolean(item.cleaned),
        customSelect: Boolean(item.customSelect),
        lengthValue: item.lengthValue === null || item.lengthValue === undefined ? null : Number(item.lengthValue),
        isActive: true,
      },
    });
  }

  console.log("Hammadde analiz parametreleri yüklendi.");
};

const seedRawMaterialAnalysisOptions = async () => {
  console.log("Hammadde analiz seçenekleri yükleniyor...");

  for (const parameter of uniqueBy(rawMaterialAnalysis, (item) => item.id)) {
    const parameterId = Number(parameter.id);
    const options = uniqueBy(parameter.options ?? [], (item) => item.id);

    for (const option of options) {
      const optionId = Number(option.id);
      const value = normalizeText(option.option ?? option.value);

      if (!value) continue;

      const id = getRawMaterialAnalysisOptionId({
        parameterId,
        optionId,
      });

      await prisma.rawMaterialAnalysisOption.upsert({
        where: {
          id,
        },
        update: {
          parameterId,
          value,
          isActive: true,
        },
        create: {
          id,
          parameterId,
          value,
          isActive: true,
        },
      });
    }
  }

  console.log("Hammadde analiz seçenekleri yüklendi.");
};

const seedProductionReactors = async () => {
  console.log("Üretim reaktörleri yükleniyor...");

  for (const item of uniqueBy(ProductionReaktor, (item) => item.id)) {
    await prisma.productionReactor.upsert({
      where: {
        id: Number(item.id),
      },
      update: {
        code: `R${item.id}`,
        name: normalizeText(item.value),
        sortOrder: Number(item.id) - 1,
        isActive: true,
      },
      create: {
        id: Number(item.id),
        code: `R${item.id}`,
        name: normalizeText(item.value),
        sortOrder: Number(item.id) - 1,
        isActive: true,
      },
    });
  }

  console.log("Üretim reaktörleri yüklendi.");
};

const seedDepartments = async () => {
  console.log("Departmanlar yükleniyor...");

  const departments = [];

  for (const item of uniqueBy(Departments, (item) => item.code)) {
    const department = await prisma.department.upsert({
      where: {
        code: item.code,
      },
      update: {
        name: item.name,
      },
      create: {
        name: item.name,
        code: item.code,
      },
    });

    departments.push(department);
  }

  console.log("Departmanlar yüklendi.");

  return departments;
};

const seedRoles = async () => {
  console.log("Roller yükleniyor...");

  const roles = [];

  for (const roleName of DEFAULT_ROLE_LIST) {
    const role = await prisma.role.upsert({
      where: {
        name: roleName,
      },
      update: {
        description: `${roleName} role`,
      },
      create: {
        name: roleName,
        description: `${roleName} role`,
      },
    });

    roles.push(role);
  }

  console.log("Roller yüklendi.");

  return roles;
};

const seedPermissions = async () => {
  console.log("Yetkiler yükleniyor...");

  for (const permission of uniqueBy(DEFAULT_PERMISSIONS, (item) => item.code)) {
    await prisma.permission.upsert({
      where: {
        code: permission.code,
      },
      update: {
        name: permission.name,
        description: permission.description || null,
      },
      create: {
        code: permission.code,
        name: permission.name,
        description: permission.description || null,
      },
    });
  }

  console.log("Yetkiler yüklendi.");
};

const seedSuperAdmin = async ({ departments, roles }) => {
  console.log("Süper Admin kullanıcıları yükleniyor...");

  const managementDepartment = departments.find((item) => item.code === "MANAGEMENT");

  if (!managementDepartment) {
    throw new Error("MANAGEMENT department not found");
  }

  const superAdminRole = roles.find((role) => role.name === ROLES.SUPER_ADMIN);

  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role not found");
  }

  const users = [
    {
      firstName: "Mustafa",
      lastName: "Topal",
      email: "mustafa.topal@plastifay.com.tr",
      password: "Mustafa123*",
    },
    {
      firstName: "İgal",
      lastName: "Kovos",
      email: "igal.kovos@plastifay.com.tr",
      password: "igal123*",
    },
  ];

  for (const item of users) {
    const passwordHash = await bcrypt.hash(item.password, 10);

    await prisma.user.upsert({
      where: {
        email: item.email,
      },
      update: {
        firstName: item.firstName,
        lastName: item.lastName,
        passwordHash,
        isActive: true,
        emailVerifiedAt: new Date(),
        tokenVersion: 0,
        failedLoginAttempts: 0,
        lockedUntil: null,
        departmentId: managementDepartment.id,
        roleId: superAdminRole.id,
      },
      create: {
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        passwordHash,
        isActive: true,
        emailVerifiedAt: new Date(),
        departmentId: managementDepartment.id,
        roleId: superAdminRole.id,
      },
    });
  }

  console.log("Süper Admin kullanıcıları yüklendi.");
};

const seedLookups = async () => {
  console.log("Lookup verileri yükleniyor...");

  await seedCountries();
  await seedCities();
  await seedDistricts();
  await seedSubRegions();
  await seedTaxOffices();

  await seedUnits();
  await seedCurrencies();
  await seedTaxRatios();
  await seedPaymentTerms();
  await seedProductionYears();
  await seedSupplierPoints();

  await seedBloodTypes();
  await seedFaultTypes();
  await seedLocations();
  await seedMachineTypes();
  await seedPlaceOfUses();
  await seedPurchased();
  await seedPurchaseReasons();
  await seedFailureReasons();
  await seedTankFarms();
  await seedTransportTypes();

  console.log("Lookup verileri yüklendi.");
};

const seedQualityLookups = async () => {
  console.log("Kalite lookup verileri yükleniyor...");

  await seedQualityAppearances();
  await seedInputControlAppearances();
  await seedRawMaterialCategories();
  await seedRawMaterialTypes();
  await seedRawMaterialAnalysisParameters();
  await seedRawMaterialAnalysisOptions();

  console.log("Kalite lookup verileri yüklendi.");
};

const seed = async () => {
  await seedLookups();
  await seedQualityLookups();

  await seedProductionReactors();

  const departments = await seedDepartments();
  const roles = await seedRoles();

  await seedPermissions();

  await seedSuperAdmin({
    departments,
    roles,
  });
};

seed()
  .catch((error) => {
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
