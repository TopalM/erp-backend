import { z } from "zod";

const nullableString = z.string().trim().optional().nullable();

const purchaseCategorySchema = z.enum(["RAW_MATERIAL", "PACKAGING", "MATERIAL", "TRADE_PRODUCT", "SERVICE", "TRANSPORT"]);

const purchaseOrderTypeSchema = z.enum(["DOMESTIC", "IMPORT"]);

const purchaseItemSchema = z
  .object({
    category: purchaseCategorySchema.default("MATERIAL"),

    rawMaterialId: nullableString,
    productId: nullableString,
    priceRecordId: nullableString,
    purchaseRequestItemId: nullableString,

    serviceName: nullableString,
    materialName: nullableString,
    description: nullableString,

    quantity: z.coerce.number().positive("Miktar 0'dan büyük olmalıdır."),
    unitId: nullableString,

    unitPrice: z.coerce.number().min(0, "Birim fiyat negatif olamaz."),

    currencyId: nullableString,

    taxRatioId: nullableString,
    differentVatRatioId: nullableString,

    totalWithoutTax: z.coerce.number().min(0).optional().nullable(),
    taxAmount: z.coerce.number().min(0).optional().nullable(),
    totalWithTax: z.coerce.number().min(0).optional().nullable(),

    note: nullableString,
  })
  .superRefine((item, ctx) => {
    if (item.category === "RAW_MATERIAL" && !item.rawMaterialId) {
      ctx.addIssue({
        code: "custom",
        path: ["rawMaterialId"],
        message: "Hammadde satınalmasında hammadde seçimi zorunludur.",
      });
    }

    if (["SERVICE", "TRANSPORT"].includes(item.category) && !item.serviceName && !item.description) {
      ctx.addIssue({
        code: "custom",
        path: ["serviceName"],
        message: "Servis/taşıma satınalmasında hizmet adı veya açıklama zorunludur.",
      });
    }

    if (["PACKAGING", "MATERIAL", "TRADE_PRODUCT"].includes(item.category) && !item.productId && !item.materialName) {
      ctx.addIssue({
        code: "custom",
        path: ["materialName"],
        message: "Malzeme satınalmasında ürün veya malzeme adı zorunludur.",
      });
    }
  });

export const createPurchaseSchema = z.object({
  supplierId: z.string().trim().min(1, "Tedarikçi zorunludur."),

  purchaseRequestId: nullableString,

  orderNo: nullableString,

  orderDate: z.coerce.date({
    error: "Sipariş tarihi zorunludur.",
  }),

  deliveryDate: z.coerce.date().optional().nullable(),

  purchaseReasonId: nullableString,
  placeOfUseId: nullableString,
  purchasedTypeId: nullableString,
  transportTypeId: nullableString,

  paymentTermId: nullableString,
  deliveryDay: z.coerce.number().int().min(0).optional().nullable(),

  orderType: purchaseOrderTypeSchema.default("DOMESTIC"),

  currencyId: nullableString,

  totalWithoutTax: z.coerce.number().min(0).optional().nullable(),
  totalTax: z.coerce.number().min(0).optional().nullable(),
  totalWithTax: z.coerce.number().min(0).optional().nullable(),

  isDifferentVat: z.coerce.boolean().optional().default(false),

  isStopaj: z.coerce.boolean().optional().default(false),
  stopajRatio: z.coerce.number().min(0).optional().nullable(),
  totalStopaj: z.coerce.number().min(0).optional().nullable(),

  isTevkifat: z.coerce.boolean().optional().default(false),
  tevkifatRatio: z.coerce.number().min(0).optional().nullable(),
  totalTevkifat: z.coerce.number().min(0).optional().nullable(),

  isInsurance: z.coerce.boolean().optional().default(false),

  supplierPointId: nullableString,

  description: nullableString,
  note: nullableString,

  items: z.array(purchaseItemSchema).min(1, "En az bir satınalma kalemi eklenmelidir."),
});

export const updatePurchaseSchema = createPurchaseSchema.partial().extend({
  items: z.array(purchaseItemSchema).optional(),
});
