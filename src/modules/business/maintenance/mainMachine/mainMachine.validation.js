import { z } from "zod";

const optionalDate = z.union([z.string(), z.date(), z.null(), z.undefined()]).optional();

const optionalDecimal = z.union([z.string(), z.number(), z.null(), z.undefined()]).optional();

export const createMainMachineSchema = z.object({
  mainMachineName: z.string().trim().min(1, "Ana makina adı zorunludur."),
  location: z.string().trim().min(1, "Lokasyon zorunludur."),
  commissioningDate: optionalDate,

  tradeMark: z.union([z.coerce.number(), z.string(), z.null(), z.undefined()]).optional(),

  model: z.string().trim().optional().nullable(),
  productionYear: z.string().trim().optional().nullable(),
  machineType: z.string().trim().optional().nullable(),

  isExproof: z.coerce.boolean().optional().default(false),
  hasSubMachine: z.coerce.boolean().optional().default(false),

  price: optionalDecimal,
  currency: z.string().trim().optional().nullable(),

  isScrap: z.coerce.boolean().optional().default(false),
  scrapDate: optionalDate,

  description: z.string().trim().optional().nullable(),
});

export const updateMainMachineSchema = createMainMachineSchema.extend({
  id: z.coerce.number().int().positive("Geçerli ana makina id zorunludur."),
  mainMachineCode: z.string().trim().optional().nullable(),
});
