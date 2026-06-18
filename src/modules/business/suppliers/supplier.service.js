import { prisma } from "../../../database/prisma.client.js";

// Parametreden gelen tedarikçi id değerini kontrol eder.
function toSupplierId(id, message = "Geçersiz tedarikçi id.") {
  if (!id || typeof id !== "string") {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }

  return id;
}

// Zorunlu metin alanlarını kontrol eder.
// Boş gelirse kontrollü 400 hata üretir.
function requireText(value, message) {
  const text = value?.toString().trim();

  if (!text) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }

  return text;
}

// Telefon numarasını +90 formatına çevirir.
// Örnek:
// 5397777777    => +905397777777
// 05397777777   => +905397777777
// +905397777777 => +905397777777
function normalizePhone(value) {
  if (!value) return null;

  const digits = value.toString().replace(/\D/g, "");

  if (!digits) return null;
  if (digits.startsWith("90")) return `+${digits}`;
  if (digits.startsWith("0")) return `+90${digits.slice(1)}`;

  return `+90${digits}`;
}

// Gelen kategori değerini güvenli hale getirir.
// Geçersiz veya boş gelirse MATERIAL kabul edilir.
function normalizeSupplierCategoryType(value) {
  if (["RAW_MATERIAL", "PACKAGING", "MATERIAL", "TRADE_PRODUCT", "SERVICE", "TRANSPORT"].includes(value)) {
    return value;
  }

  return "MATERIAL";
}

// Tedarikçi belge kaydını client formatına dönüştürür.
function mapDocumentToClient(document) {
  return {
    ...document,
    documentType: document.documentType?.code || document.documentType?.name || document.documentType || "",
  };
}

// Prisma Supplier kaydını frontend'in beklediği legacy alanlarla uyumlu hale getirir.
// Böylece yeni normalize model kullanılırken eski client alan adları da bozulmaz.
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

// Tedarikçi listesini getirir.
// Purchasing ekranı MATERIAL,SERVICE filtresiyle çağırır.
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
    include: {
      categories: true,
      rawMaterials: true,
      documents: {
        include: {
          documentType: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return rows.map(toClientSupplier);
}

// Yeni tedarikçi oluşturur.
// country alanı Prisma modelinde default("Turkey") olduğu için burada ayrıca gönderilmez.
// city ve district string olarak kaydedilir: Örn. city: "Kocaeli", district: "Dilovası".
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

      // Modelde city zorunlu String olduğu için mutlaka gönderilmeli.
      // Örn: "İstanbul", "Kocaeli", "Ankara"
      city: requireText(payload.city, "Şehir zorunludur."),

      // district opsiyonel.
      district: payload.district?.toString().trim() || null,

      taxOffice: payload.taxOffice || null,
      taxNumber: payload.taxNumber || null,

      contactName: requireText(payload.supplierResponsiblePerson, "Firma sorumlusu zorunludur."),
      contactPhone,
      contactEmail: (payload.contactEmail || payload.email || "").toLowerCase() || null,

      categories: {
        create: [{ type: categoryType }],
      },

      createdById: userId,
    },
    include: {
      categories: true,
      rawMaterials: true,
      documents: {
        include: {
          documentType: true,
        },
      },
    },
  });

  return toClientSupplier(row);
}

// Partial update datası üretir.
// Gönderilmeyen alanlar güncellenmez.
// country alanı modelde default olduğu için update sırasında da elle değiştirilmez.
function buildSupplierUpdateData(payload, userId = null) {
  const data = {
    ...(userId && { updatedById: userId }),
  };

  if (payload.companyName !== undefined) data.name = payload.companyName;
  if (payload.phoneNumber !== undefined) data.phone = normalizePhone(payload.phoneNumber);
  if (payload.email !== undefined) data.email = payload.email;

  if (payload.address !== undefined) data.address = payload.address;

  if (payload.city !== undefined) data.city = payload.city;
  if (payload.district !== undefined) data.district = payload.district || null;

  if (payload.taxOffice !== undefined) data.taxOffice = payload.taxOffice || null;
  if (payload.taxNumber !== undefined) data.taxNumber = payload.taxNumber || null;

  if (payload.supplierResponsiblePerson !== undefined) {
    data.contactName = payload.supplierResponsiblePerson;
  }

  if (payload.mobilePhoneNumber !== undefined) {
    data.contactPhone = normalizePhone(payload.mobilePhoneNumber);
  }

  if (payload.contactEmail !== undefined || payload.email !== undefined) {
    data.contactEmail = payload.contactEmail || payload.email || null;
  }

  if (payload.isDocumentNone !== undefined) data.isDocumentNone = Boolean(payload.isDocumentNone);
  if (payload.documentRequestEnabled !== undefined) data.documentRequestEnabled = Boolean(payload.documentRequestEnabled);

  if (payload.iso9001 !== undefined) data.iso9001 = Boolean(payload.iso9001);
  if (payload.iso14001 !== undefined) data.iso14001 = Boolean(payload.iso14001);
  if (payload.iso45001 !== undefined) data.iso45001 = Boolean(payload.iso45001);
  if (payload.iso50001 !== undefined) data.iso50001 = Boolean(payload.iso50001);

  return data;
}

// Mevcut tedarikçiyi günceller.
// Kategori değişirse yeni kategori ilişkisi yoksa eklenir.
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
      include: {
        categories: true,
        rawMaterials: true,
        documents: {
          include: {
            documentType: true,
          },
        },
      },
    });

    return toClientSupplier(row);
  });
}

// Tedarikçiyi hard delete yapmaz.
// deletedAt ve deletedById alanlarını doldurarak soft delete uygular.
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
    include: {
      categories: true,
      rawMaterials: true,
      documents: {
        include: {
          documentType: true,
        },
      },
    },
  });

  return toClientSupplier(row);
}
