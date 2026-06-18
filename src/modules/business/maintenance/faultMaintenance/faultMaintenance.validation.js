import { z } from "zod";

export const createFaultMaintenanceSchema = z.object({
  mainMachineName: z.coerce.number().int().positive(),
  subMachineName: z.union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()]).optional(),
  location: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

export const updateFaultMaintenanceSchema = z.object({
  id: z.coerce.number().int().positive(),

  mainMachineName: z.coerce.number().int().positive().optional(),
  subMachineName: z.union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()]).optional(),

  location: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),

  faultType: z.string().optional().nullable(),
  reasonFailure: z.string().optional().nullable(),
});

export const deleteFaultMaintenanceSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const requestFaultMaintenanceSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const statusFaultMaintenanceSchema = z.object({
  id: z.coerce.number().int().positive(),

  status: z.coerce.number().int().min(0).max(4),

  endOfWorkDescription: z.string().optional().nullable(),
  faultType: z.string().optional().nullable(),
  reasonFailure: z.string().optional().nullable(),

  workingPersonel: z.string().optional().nullable(),
  materials: z.string().optional().nullable(),
  quantities: z.string().optional().nullable(),
  unitPrices: z.string().optional().nullable(),
  totalPrices: z.string().optional().nullable(),

  totalPriceWithMaterialAndWorking: z.union([z.string(), z.number(), z.null(), z.undefined()]).optional(),

  workStartDateTime: z.union([z.string(), z.date(), z.null(), z.undefined()]).optional(),
  workEndDateTime: z.union([z.string(), z.date(), z.null(), z.undefined()]).optional(),

  rejectReason: z.string().optional().nullable(),
});
