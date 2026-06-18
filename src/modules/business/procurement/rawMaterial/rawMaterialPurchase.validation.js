import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value === "" ? null : value));

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().optional().nullable(),
);

const requiredId = z.string().trim().min(1);

const optionalId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.string().trim().optional().nullable(),
);

export const createPriceRequestSchema = z.object({
  draftId: optionalId,
  rawMaterialName: optionalText,
  productId: optionalId,
  channel: z.enum(["MAIL", "WHATSAPP"]),
  subject: optionalText,
  message: z.string().trim().min(1),
  supplierIds: z.array(requiredId).min(1),
});

export const purchaseOrderItemSchema = z.object({
  productId: optionalId,
  priceRecordId: optionalId,
  rawMaterialName: z.string().trim().min(1),
  quantity: z.coerce.number().positive(),
  unit: z.string().default("ton"),
  unitPrice: z.coerce.number().nonnegative(),
  currency: z.string().default("USD"),
  note: optionalText,
});

export const createPurchaseOrderSchema = z.object({
  supplierId: requiredId,
  deliveryDate: optionalText,
  paymentTerm: optionalText,
  deliveryDay: optionalNumber,
  orderType: z.enum(["DOMESTIC", "IMPORT"]).default("DOMESTIC"),
  currency: z.string().default("USD"),
  note: optionalText,
  items: z.array(purchaseOrderItemSchema).min(1),
});

export const updatePurchaseOrderSchema = createPurchaseOrderSchema.partial().extend({
  items: z.array(purchaseOrderItemSchema).optional(),
});

export const receiptItemSchema = z.object({
  productId: optionalId,
  rawMaterialName: z.string().trim().min(1),
  quantity: z.coerce.number().positive(),
  unit: z.string().default("ton"),
  lotNo: optionalText,
});

export const createReceiptSchema = z.object({
  supplierId: requiredId,
  purchaseOrderId: optionalId,
  receiptDate: z.string(),
  supplierBatchNo: optionalText,
  documentNo: optionalText,
  note: optionalText,
  items: z.array(receiptItemSchema).min(1),
});

export const updateReceiptSchema = createReceiptSchema.partial().extend({
  items: z.array(receiptItemSchema).optional(),
});

export const updatePurchaseSettingsSchema = z.object({
  enabled: z.boolean(),
  messageLanguage: z.enum(["TR", "EN"]),
  sendMode: z.enum(["manual", "draft", "backend"]),
  defaultCountryCode: z.string().default("90"),
  mailSubjectTr: optionalText,
  mailSubjectEn: optionalText,
  messageTr: z.string().min(1),
  messageEn: z.string().min(1),
  addProductName: z.boolean(),
  addPaymentTerm: z.boolean(),
  addDeliveryTerm: z.boolean(),
});

export const createPriceRecordSchema = z.object({
  supplierId: requiredId,
  productId: optionalId,
  rawMaterialName: z.string().trim().min(1),
  price: z.coerce.number().positive(),
  currency: z.string().default("USD"),
  unit: z.string().default("ton"),
  priceDate: z.string(),
  validUntil: optionalText,
  paymentTerm: optionalText,
  deliveryDay: optionalNumber,
  source: z.enum(["MANUAL", "WHATSAPP", "MAIL", "PHONE"]).default("MANUAL"),
  note: optionalText,
});

export const updatePriceRecordSchema = createPriceRecordSchema.partial();

export const sendSupplierPriceRequestMailSchema = z.object({
  supplierId: requiredId,
  productId: optionalId,
  rawMaterialName: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  message: z.string().trim().min(1),
});

export const publicPriceRequestTokenSchema = z.object({
  token: z.string().trim().min(10),
});

export const respondPublicPriceRequestSchema = z.object({
  price: z.coerce.number().positive(),
  currency: z.string().trim().default("USD"),
  unit: z.string().trim().default("ton"),
  validUntil: optionalText,
  paymentTerm: optionalText,
  deliveryDay: optionalNumber,
  note: optionalText,
});
