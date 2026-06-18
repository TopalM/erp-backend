import bcrypt from "bcryptjs";

import { prisma } from "../database/prisma.client.js";

import { DEFAULT_ROLE_LIST, ROLES } from "../constants/roles.js";

import { Departments } from "./data/Departments.js";
import { DEFAULT_PERMISSIONS } from "./data/permissions.js";
import { ProductionReaktor } from "./data/ProductionReaktor.js";

import { BloodType } from "./data/Lookups/BloodType.js";
import { Cities } from "./data/Lookups/Cities.js";
import { Countries } from "./data/Lookups/Countries.js";
import { Districts } from "./data/Lookups/Districts.js";
import { SubRegions } from "./data/Lookups/SubRegions.js";
import { TaxOffices } from "./data/Lookups/TaxOffices.js";
import { Currency } from "./data/Lookups/Currency.js";
import { FaultType } from "./data/Lookups/FaultType.js";
import { Locations } from "./data/Lookups/Locations.js";
import { MachineType } from "./data/Lookups/MachineType.js";
import { PaymentTerm } from "./data//Lookups/PaymentTerm.js";
import { PaymentTerm_RawMaterial } from "./data/Lookups/PaymentTerm_RawMaterial.js";
import { PlaceOfUse } from "./data/Lookups/PlaceOfUse.js";
import { ProductionYear } from "./data/Lookups/ProductionYear.js";
import { Purchased } from "./data/Lookups/Purchased.js";
import { reasonFailure } from "./data/Lookups/reasonFailure.js";
import { SupplierPoint } from "./data/Lookups/SupplierPoint.js";
import { TankFarm } from "./data/Lookups/TankFarm.js";
import { TaxRatio } from "./data/Lookups/TaxRatio.js";
import { Transport } from "./data/Lookups/Transport.js";
import { PurchaseReeason } from "./data/Lookups/PurchaseReason.js";
import { utilityMeters } from "./data/UtilityMeters.js";
import { utilityMeterTypes } from "./data/Lookups/utilityMeterTypes.js";

// Seed datasındaki gösterilecek değeri standart hale getirir.
const getSeedName = (item) => {
  return String(item.name ?? item.label ?? item.value ?? item.reasonPurchase ?? item.tankName ?? "").trim();
};

// "7 Gün", "30 Gün", "120 Gün" gibi ifadelerden gün sayısını çıkarır.
const extractPaymentTermDays = (value) => {
  const match = String(value).match(/\d+/);

  return match ? Number(match[0]) : null;
};

// Country, City, District, TaxOffice gibi lokasyon lookup verilerini yükler.
const seedLocationLookups = async () => {
  console.log("Lokasyon lookup verileri yükleniyor...");

  for (const country of Countries) {
    await prisma.country.upsert({
      where: { id: country.id },
      update: {
        value: country.value,
        iso2: country.iso2,
        phoneCode: country.phoneCode,
      },
      create: {
        id: country.id,
        value: country.value,
        iso2: country.iso2,
        phoneCode: country.phoneCode,
      },
    });
  }

  for (const subRegion of SubRegions) {
    await prisma.subRegion.upsert({
      where: {
        legacyId: subRegion.id,
      },
      update: {
        name: subRegion.subregion,
        countryId: subRegion.countryId,
        isActive: true,
      },
      create: {
        legacyId: subRegion.id,
        name: subRegion.subregion,
        countryId: subRegion.countryId,
        isActive: true,
      },
    });
  }

  for (const city of Cities) {
    await prisma.city.upsert({
      where: {
        id: city.id,
      },
      update: {
        value: city.value,
        countryId: city.countryId,
      },
      create: {
        id: city.id,
        value: city.value,
        countryId: city.countryId,
      },
    });
  }

  for (const district of Districts) {
    await prisma.district.upsert({
      where: {
        id: district.id,
      },
      update: {
        value: district.value,
        cityId: district.cityId,
      },
      create: {
        id: district.id,
        value: district.value,
        cityId: district.cityId,
      },
    });
  }

  for (const taxOffice of TaxOffices) {
    await prisma.taxOffice.upsert({
      where: {
        legacyId: taxOffice.id,
      },
      update: {
        name: taxOffice.value,
        cityId: taxOffice.cityId,
        isActive: true,
      },
      create: {
        legacyId: taxOffice.id,
        name: taxOffice.value,
        cityId: taxOffice.cityId,
        isActive: true,
      },
    });
  }

  console.log("Lokasyon lookup verileri yüklendi.");
};

const seedUtilityMeterTypes = async () => {
  console.log("Sayaç tipleri yükleniyor...");

  for (const item of utilityMeterTypes) {
    await prisma.utilityMeterType.upsert({
      where: {
        code: item.code,
      },
      update: {
        name: item.name,
        defaultUnit: item.defaultUnit,
        isActive: true,
      },
      create: {
        legacyId: item.id ?? null,
        code: item.code,
        name: item.name,
        defaultUnit: item.defaultUnit,
        isActive: true,
      },
    });
  }

  console.log("Sayaç tipleri yüklendi.");
};

const seedUtilityMeters = async () => {
  console.log("Sayaçlar yükleniyor...");

  for (const item of utilityMeters) {
    const meterType = await prisma.utilityMeterType.findUnique({
      where: {
        code: item.type,
      },
      select: {
        id: true,
      },
    });

    if (!meterType) {
      throw new Error(`Sayaç tipi bulunamadı: ${item.type}`);
    }

    await prisma.utilityMeter.upsert({
      where: {
        code: item.code,
      },
      update: {
        name: item.name,
        meterTypeId: meterType.id,
        unit: item.unit,
        isActive: true,
      },
      create: {
        code: item.code,
        name: item.name,
        meterTypeId: meterType.id,
        unit: item.unit,
        isActive: true,
      },
    });
  }

  console.log("Sayaçlar yüklendi.");
};

// Para birimlerini yükler.
const seedCurrencies = async () => {
  console.log("Para birimleri yükleniyor...");

  for (const item of Currency) {
    const code = String(item.value ?? item.code ?? "").trim();

    await prisma.currency.upsert({
      where: {
        legacyId: item.id,
      },
      update: {
        code,
        name: item.label ? String(item.label).trim() : null,
        isActive: true,
      },
      create: {
        legacyId: item.id,
        code,
        name: item.label ? String(item.label).trim() : null,
        isActive: true,
      },
    });
  }

  console.log("Para birimleri yüklendi.");
};

// KDV oranlarını yükler.
const seedTaxRatios = async () => {
  console.log("KDV oranları yükleniyor...");

  for (const item of TaxRatio) {
    const value = Number(item.value);
    const name = `%${value}`;

    await prisma.taxRatio.upsert({
      where: {
        legacyId: item.id,
      },
      update: {
        value,
        name,
        isActive: true,
      },
      create: {
        legacyId: item.id,
        value,
        name,
        isActive: true,
      },
    });
  }

  console.log("KDV oranları yüklendi.");
};

// Ödeme vadelerini yükler.
// GENERAL: Malzeme / hizmet satınalma
// RAW_MATERIAL: Hammadde satınalma
const seedPaymentTerms = async () => {
  console.log("Ödeme vadeleri yükleniyor...");

  for (const item of PaymentTerm) {
    const name = String(item.value).trim();

    await prisma.paymentTerm.upsert({
      where: {
        scope_legacyId: {
          scope: "GENERAL",
          legacyId: item.id,
        },
      },
      update: {
        code: null,
        name,
        days: extractPaymentTermDays(name),
        requiresDay: false,
        isActive: true,
      },
      create: {
        legacyId: item.id,
        scope: "GENERAL",
        code: null,
        name,
        days: extractPaymentTermDays(name),
        requiresDay: false,
        isActive: true,
      },
    });
  }

  for (const item of PaymentTerm_RawMaterial) {
    await prisma.paymentTerm.upsert({
      where: {
        scope_legacyId: {
          scope: "RAW_MATERIAL",
          legacyId: item.id,
        },
      },
      update: {
        code: String(item.value).trim(),
        name: String(item.label).trim(),
        days: null,
        requiresDay: Boolean(item.requiresDay),
        isActive: true,
      },
      create: {
        legacyId: item.id,
        scope: "RAW_MATERIAL",
        code: String(item.value).trim(),
        name: String(item.label).trim(),
        days: null,
        requiresDay: Boolean(item.requiresDay),
        isActive: true,
      },
    });
  }

  console.log("Ödeme vadeleri yüklendi.");
};

// Üretim yıllarını yükler.
const seedProductionYears = async () => {
  console.log("Üretim yılları yükleniyor...");

  for (const item of ProductionYear) {
    await prisma.productionYear.upsert({
      where: {
        legacyId: item.id,
      },
      update: {
        year: Number(item.value),
        isActive: true,
      },
      create: {
        legacyId: item.id,
        year: Number(item.value),
        isActive: true,
      },
    });
  }

  console.log("Üretim yılları yüklendi.");
};

// Tedarikçi puanlarını yükler.
const seedSupplierPoints = async () => {
  console.log("Tedarikçi puanları yükleniyor...");

  for (const item of SupplierPoint) {
    await prisma.supplierPoint.upsert({
      where: {
        legacyId: item.id,
      },
      update: {
        value: Number(item.value),
        label: String(item.value),
        isActive: true,
      },
      create: {
        legacyId: item.id,
        value: Number(item.value),
        label: String(item.value),
        isActive: true,
      },
    });
  }

  console.log("Tedarikçi puanları yüklendi.");
};

// Standart lookup modellerini yükler.
// Kullanılan model yapısı:
// id String @default(cuid())
// legacyId Int? @unique
// name String
// isActive Boolean
const seedSimpleLookup = async ({ label, delegate, data }) => {
  console.log(`${label} yükleniyor...`);

  for (const item of data) {
    const name = getSeedName(item);

    await delegate.upsert({
      where: {
        legacyId: item.id,
      },
      update: {
        name,
        isActive: true,
      },
      create: {
        legacyId: item.id,
        name,
        isActive: true,
      },
    });
  }

  console.log(`${label} yüklendi.`);
};

// Bağımsız lookup tablolarını yükler.
const seedIndependentLookups = async () => {
  await seedCurrencies();
  await seedTaxRatios();
  await seedPaymentTerms();
  await seedProductionYears();
  await seedSupplierPoints();

  await seedSimpleLookup({
    label: "Kan grupları",
    delegate: prisma.bloodType,
    data: BloodType,
  });

  await seedSimpleLookup({
    label: "Arıza tipleri",
    delegate: prisma.faultType,
    data: FaultType,
  });

  await seedSimpleLookup({
    label: "Lokasyonlar",
    delegate: prisma.location,
    data: Locations,
  });

  await seedSimpleLookup({
    label: "Makine tipleri",
    delegate: prisma.machineType,
    data: MachineType,
  });

  await seedSimpleLookup({
    label: "Kullanım yerleri",
    delegate: prisma.placeOfUse,
    data: PlaceOfUse,
  });

  await seedSimpleLookup({
    label: "Satınalma tipleri",
    delegate: prisma.purchased,
    data: Purchased,
  });

  await seedSimpleLookup({
    label: "Satınalma nedenleri",
    delegate: prisma.purchaseReason,
    data: PurchaseReeason,
  });

  await seedSimpleLookup({
    label: "Arıza nedenleri",
    delegate: prisma.failureReason,
    data: reasonFailure,
  });

  await seedSimpleLookup({
    label: "Tank çiftliği verileri",
    delegate: prisma.tankFarm,
    data: TankFarm,
  });

  await seedSimpleLookup({
    label: "Taşıma tipleri",
    delegate: prisma.transportType,
    data: Transport,
  });
};

// Yetki kayıtlarını yükler.
const seedPermissions = async () => {
  console.log("Yetkiler yükleniyor...");

  for (const permission of DEFAULT_PERMISSIONS) {
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

// Tüm lookup verilerini yükler.
const seedLookups = async () => {
  console.log("Lookup verileri yükleniyor...");

  await seedLocationLookups();
  await seedIndependentLookups();
  await seedPermissions();

  console.log("Lookup verileri yüklendi.");
};

// Üretim reaktörlerini yükler.
// Üretim reaktörlerini yükler.
const seedProductionReactors = async () => {
  console.log("Üretim reaktörleri yükleniyor...");

  for (const item of ProductionReaktor) {
    const sortOrder = Number(item.id) - 1;

    await prisma.productionReactor.upsert({
      where: {
        code: `R${item.id}`,
      },
      update: {
        name: item.value,
        sortOrder,
        isActive: true,
      },
      create: {
        code: `R${item.id}`,
        name: item.value,
        sortOrder,
        isActive: true,
      },
    });
  }

  console.log("Üretim reaktörleri yüklendi.");
};

// Departman kayıtlarını yükler.
const seedDepartments = async () => {
  console.log("Departmanlar yükleniyor...");

  const departments = [];

  for (const item of Departments) {
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

// Sistem rollerini yükler.
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

// Varsayılan Süper Admin kullanıcısını oluşturur veya günceller.
const seedSuperAdmin = async ({ departments, roles }) => {
  console.log("Süper Admin kullanıcısı yükleniyor...");

  const managementDepartment = departments.find((item) => item.code === "MANAGEMENT");

  if (!managementDepartment) {
    throw new Error("MANAGEMENT department not found");
  }

  const superAdminRole = roles.find((role) => role.name === ROLES.SUPER_ADMIN);

  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role not found");
  }

  const passwordHash = await bcrypt.hash("Mustafa123*", 10);

  const superAdminUser = await prisma.user.upsert({
    where: {
      email: "mustafa.topal@plastifay.com.tr",
    },
    update: {
      firstName: "Mustafa",
      lastName: "Topal",
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
      firstName: "Mustafa",
      lastName: "Topal",
      email: "mustafa.topal@plastifay.com.tr",
      passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      departmentId: managementDepartment.id,
      roleId: superAdminRole.id,
    },
  });

  const igalPasswordHash = await bcrypt.hash("igal123*", 10);

  const igalUser = await prisma.user.upsert({
    where: {
      email: "igal.kovos@plastifay.com.tr",
    },
    update: {
      firstName: "İgal",
      lastName: "Kovos",
      passwordHash: igalPasswordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      tokenVersion: 0,
      failedLoginAttempts: 0,
      lockedUntil: null,
      departmentId: managementDepartment.id,
      roleId: superAdminRole.id,
    },
    create: {
      firstName: "İgal",
      lastName: "Kovos",
      email: "igal.kovos@plastifay.com.tr",
      passwordHash: igalPasswordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      departmentId: managementDepartment.id,
      roleId: superAdminRole.id,
    },
  });

  console.log({
    department: managementDepartment,
    users: [
      {
        id: superAdminUser.id,
        email: superAdminUser.email,
        role: ROLES.SUPER_ADMIN,
        password: "Mustafa123*",
      },
      {
        id: igalUser.id,
        email: igalUser.email,
        role: ROLES.SUPER_ADMIN,
        password: "igal123*",
      },
    ],
  });

  console.log("Süper Admin kullanıcısı yüklendi.");
};

// Ana seed akışı.
const seed = async () => {
  await seedLookups();
  await seedProductionReactors();

  await seedUtilityMeterTypes();
  await seedUtilityMeters();

  const departments = await seedDepartments();
  const roles = await seedRoles();

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
