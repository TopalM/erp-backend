import { z } from "zod";

export const createDocumentSchema = z.object({
  module: z.enum(["PURCHASING", "SUPPLIER", "QUALITY", "PRODUCTION", "SHIPMENT", "MAINTENANCE", "EMPLOYEE", "ACCOUNTING", "UTILITY", "SYSTEM"]),
  entityType: z.enum([
    "PURCHASE_INVOICE",
    "PURCHASE_REQUEST",
    "PURCHASE_ORDER",
    "SUPPLIER",
    "SUPPLIER_DOCUMENT",
    "QUALITY_INSPECTION",
    "QUALITY_CERTIFICATE",
    "QUALITY_DEVIATION",
    "PRODUCTION_ORDER",
    "PRODUCTION_BATCH",
    "SHIPMENT_PLAN",
    "DISPATCH_NOTE",
    "MAINTENANCE",
    "EQUIPMENT",
    "EMPLOYEE",
    "UTILITY_READING",
    "OTHER",
  ]),
  entityId: z.string().trim().min(1, "Entity id zorunludur."),
  documentType: z
    .enum([
      "INVOICE",
      "ISO_9001",
      "ISO_14001",
      "ISO_45001",
      "ISO_50001",
      "COA",
      "SDS",
      "TDS",
      "ANALYSIS_REPORT",
      "DELIVERY_NOTE",
      "PACKING_LIST",
      "MAINTENANCE_FORM",
      "EMPLOYEE_DOCUMENT",
      "UTILITY_REPORT",
      "OTHER",
    ])
    .optional()
    .default("OTHER"),
  title: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
});
