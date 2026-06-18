import { z } from "zod";

export const createPeriodicMaintenanceSchema = z.object({
  companyName: z.coerce.number().int().positive(),
  invoicePrice: z.union([z.string(), z.number()]),
  currency: z.string().trim().min(1),

  location: z.string().trim().min(1),
  mainMachineName: z.coerce.number().int().positive(),
  subMachineName: z.union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()]).optional(),

  periodicMaintenanceInvoiceDate: z.string().min(1),
  firstPeriodicMaintenanceDate: z.string().min(1),
  annualPlanned: z.string().trim().min(1),
});

export const updatePeriodicMaintenanceSchema = createPeriodicMaintenanceSchema.partial().extend({
  id: z.coerce.number().int().positive(),
});

export const deletePeriodicMaintenanceSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const statusPeriodicMaintenanceSchema = z.object({
  id: z.coerce.number().int().positive(),
  actualMaintenanceDate: z.string().optional(),
  description: z.string().optional(),
});
