import { z } from "zod";

// Boş string gelen opsiyonel text alanlarını null değerine çevirir.
const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value === "" ? null : value));

// Opsiyonel numeric id alanları.
// İleride cityId/countryId kullanırsan destekler.
const optionalNumberId = z
  .union([z.string(), z.number()])
  .optional()
  .nullable()
  .transform((value) => {
    if (value === "" || value === null || value === undefined) return null;

    return Number(value);
  });

// Supplier kategori tipi.
// Purchasing için MATERIAL veya SERVICE.
// Hammadde tarafı gerekirse RAW_MATERIAL kullanabilir ama rawMaterialPurchase modülüne dokunmuyoruz.
const supplierCategoryType = z.enum(["RAW_MATERIAL", "MATERIAL", "SERVICE"]);

export const createSupplierSchema = z.object({
  code: optionalText,

  companyName: z.string().trim().min(1, "Firma adı zorunludur."),

  categoryType: supplierCategoryType.optional().default("MATERIAL"),

  phoneNumber: optionalText,
  email: optionalText,

  taxOffice: optionalText,
  taxNumber: optionalText,

  // Mevcut frontend string gönderiyor.
  city: optionalText,
  district: optionalText,

  // Yeni relation yapısı için opsiyonel bırakıldı.
  countryId: optionalNumberId,
  cityId: optionalNumberId,
  districtId: optionalNumberId,

  address: optionalText,

  supplierResponsiblePerson: optionalText,
  mobilePhoneNumber: optionalText,
  contactEmail: optionalText,

  isDocumentNone: z.coerce.boolean().optional().default(false),
  documentRequestEnabled: z.coerce.boolean().optional().default(false),

  iso9001: z.coerce.boolean().optional().default(false),
  iso14001: z.coerce.boolean().optional().default(false),
  iso45001: z.coerce.boolean().optional().default(false),
  iso50001: z.coerce.boolean().optional().default(false),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const supplierIdSchema = z.object({
  id: z.string().trim().min(1, "Geçerli tedarikçi id zorunludur."),
});
