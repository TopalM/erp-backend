import { prisma } from "../../../database/prisma.client.js";

const supplierInclude = {
  country: true,
  city: true,
  district: true,
  taxOffice: true,
  categories: true,
  rawMaterials: true,
  documents: {
    include: {
      documentType: true,
    },
  },
};

function toSupplierId(id, message = "Geçersiz tedarikçi id.") {
  if (!id || typeof id !== "string") {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }

  return id;
}

function requireText(value, message) {
  const text = value?.toString().trim();

  if (!text) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }

  return text;
}

function normalizePhone(value) {
  if (!value) return null;

  const digits = value.toString().replace(/\D/g, "");

  if (!digits) return null;
  if (digits.startsWith("90")) return `+${digits}`;
  if (digits.startsWith("0")) return `+90${digits.slice(1)}`;

  return `+90${digits}`;
}

function normalizeSupplierCategoryType(value) {
  if (["RAW_MATERIAL", "PACKAGING", "MATERIAL", "TRADE_PRODUCT", "SERVICE", "TRANSPORT"].includes(value)) {
    return value;
  }

  return "MATERIAL";
}

function mapDocumentToClient(document) {
  return {
    ...document,
    documentType: document.documentType?.code || document.documentType?.name || document.documentType || "",
  };
}

function toNullableInt(value) {
  if (value === undefined || value === null || value === "") return null;

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? null : numberValue;
}

function toClientSupplier(row) {
  if (!row) return row;

  const categories = row.categories || [];
  const primaryCategory = categories[0]?.type || null;

  return {
    ...row,

    _id: row.id,
    code: row.id,

    companyName: row.name,
    phoneNumber: row.phone,
    mobilePhoneNumber: row.contactPhone,
    supplierResponsiblePerson: row.contactName,

    country: row.country?.value || null,
    city: row.city?.value || null,
    district: row.district?.value || null,
    taxOffice: row.taxOffice?.value || null,

    categoryType: primaryCategory,
    categoryTypes: categories.map((category) => category.type),

    isDocumentNone: row.isDocumentNone ?? false,
    documentRequestEnabled: row.documentRequestEnabled ?? false,

    iso9001: row.iso9001 ?? false,
    iso14001: row.iso14001 ?? false,
    iso45001: row.iso45001 ?? false,
    iso50001: row.iso50001 ?? false,

    documents: (row.documents || []).map(mapDocumentToClient),
  };
}

export async function listSuppliersService(query = {}) {
  const categoryTypes = query.categoryTypes ? String(query.categoryTypes).split(",").filter(Boolean) : [];

  const rows = await prisma.supplier.findMany({
    where: {
      deletedAt: null,
      ...(categoryTypes.length && {
        categories: {
          some: {
            type: {
              in: categoryTypes,
            },
          },
        },
      }),
    },
    include: supplierInclude,
    orderBy: {
      name: "asc",
    },
  });

  return rows.map(toClientSupplier);
}

export async function createSupplierService(payload, userId = null) {
  const phone = normalizePhone(payload.phoneNumber);
  const contactPhone = normalizePhone(payload.mobilePhoneNumber);
  const categoryType = normalizeSupplierCategoryType(payload.categoryType);

  const row = await prisma.supplier.create({
    data: {
      name: requireText(payload.companyName, "Firma adı zorunludur."),
      phone: requireText(phone, "Firma telefon numarası zorunludur."),
      email: requireText(payload.email, "Email zorunludur.").toLowerCase(),

      address: requireText(payload.address, "Adres zorunludur."),

      countryId: toNullableInt(payload.countryId),
      cityId: toNullableInt(payload.cityId),
      districtId: toNullableInt(payload.districtId),
      taxOfficeId: payload.taxOfficeId || null,

      taxNumber: payload.taxNumber || null,

      contactName: requireText(payload.supplierResponsiblePerson, "Firma sorumlusu zorunludur."),
      contactPhone,
      contactEmail: (payload.contactEmail || payload.email || "").toLowerCase() || null,

      isDocumentNone: Boolean(payload.isDocumentNone),
      documentRequestEnabled: Boolean(payload.documentRequestEnabled),

      iso9001: Boolean(payload.iso9001),
      iso14001: Boolean(payload.iso14001),
      iso45001: Boolean(payload.iso45001),
      iso50001: Boolean(payload.iso50001),

      notes: payload.notes || null,
      risk: payload.risk || null,

      categories: {
        create: [{ type: categoryType }],
      },

      createdById: userId,
    },
    include: supplierInclude,
  });

  return toClientSupplier(row);
}

function buildSupplierUpdateData(payload, userId = null) {
  const data = {
    ...(userId && { updatedById: userId }),
  };

  if (payload.companyName !== undefined) data.name = payload.companyName;
  if (payload.phoneNumber !== undefined) data.phone = normalizePhone(payload.phoneNumber);
  if (payload.email !== undefined) data.email = payload.email.toLowerCase();

  if (payload.address !== undefined) data.address = payload.address;

  if (payload.countryId !== undefined) data.countryId = toNullableInt(payload.countryId);
  if (payload.cityId !== undefined) data.cityId = toNullableInt(payload.cityId);
  if (payload.districtId !== undefined) data.districtId = toNullableInt(payload.districtId);
  if (payload.taxOfficeId !== undefined) data.taxOfficeId = payload.taxOfficeId || null;

  if (payload.taxNumber !== undefined) data.taxNumber = payload.taxNumber || null;

  if (payload.supplierResponsiblePerson !== undefined) {
    data.contactName = payload.supplierResponsiblePerson;
  }

  if (payload.mobilePhoneNumber !== undefined) {
    data.contactPhone = normalizePhone(payload.mobilePhoneNumber);
  }

  if (payload.contactEmail !== undefined || payload.email !== undefined) {
    data.contactEmail = (payload.contactEmail || payload.email || "").toLowerCase() || null;
  }

  if (payload.isDocumentNone !== undefined) data.isDocumentNone = Boolean(payload.isDocumentNone);
  if (payload.documentRequestEnabled !== undefined) data.documentRequestEnabled = Boolean(payload.documentRequestEnabled);

  if (payload.iso9001 !== undefined) data.iso9001 = Boolean(payload.iso9001);
  if (payload.iso14001 !== undefined) data.iso14001 = Boolean(payload.iso14001);
  if (payload.iso45001 !== undefined) data.iso45001 = Boolean(payload.iso45001);
  if (payload.iso50001 !== undefined) data.iso50001 = Boolean(payload.iso50001);

  if (payload.notes !== undefined) data.notes = payload.notes || null;
  if (payload.risk !== undefined) data.risk = payload.risk || null;

  return data;
}

export async function updateSupplierService(id, payload, userId = null) {
  const supplierId = toSupplierId(id);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.supplier.findFirst({
      where: {
        id: supplierId,
        deletedAt: null,
      },
      include: {
        categories: true,
      },
    });

    if (!existing) {
      const error = new Error("Tedarikçi bulunamadı.");
      error.statusCode = 404;
      throw error;
    }

    if (payload.categoryType) {
      const categoryType = normalizeSupplierCategoryType(payload.categoryType);
      const hasCategory = existing.categories.some((category) => category.type === categoryType);

      if (!hasCategory) {
        await tx.supplierCategory.create({
          data: {
            supplierId,
            type: categoryType,
          },
        });
      }
    }

    const row = await tx.supplier.update({
      where: {
        id: supplierId,
      },
      data: buildSupplierUpdateData(payload, userId),
      include: supplierInclude,
    });

    return toClientSupplier(row);
  });
}

export async function deleteSupplierService(id, userId = null) {
  const supplierId = toSupplierId(id);

  const existing = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      deletedAt: null,
    },
  });

  if (!existing) {
    const error = new Error("Tedarikçi bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  const row = await prisma.supplier.update({
    where: {
      id: supplierId,
    },
    data: {
      deletedAt: new Date(),
      ...(userId && { deletedById: userId }),
    },
    include: supplierInclude,
  });

  return toClientSupplier(row);
}
