import { z } from "zod";

const optionalDate = z.union([z.string(), z.date(), z.null(), z.undefined()]).optional();

const optionalDecimal = z.union([z.string(), z.number(), z.null(), z.undefined()]).optional();

export const createSubMachineSchema = z.object({
  mainMachineName: z.coerce.number().int().positive("Ana makina zorunludur."),
  subMachineName: z.string().trim().min(1, "Alt makina adı zorunludur."),

  location: z.string().trim().min(1, "Lokasyon zorunludur."),
  commissioningDate: optionalDate,

  tradeMark: z.coerce.number().int().positive("Marka zorunludur."),
  model: z.string().trim().min(1, "Model zorunludur."),
  productionYear: z.string().trim().min(1, "Üretim yılı zorunludur."),
  machineType: z.string().trim().min(1, "Makina tipi zorunludur."),

  isExproof: z.coerce.boolean().optional().default(false),

  price: optionalDecimal,
  currency: z.string().trim().min(1, "Para birimi zorunludur."),

  description: z.string().trim().min(1, "Açıklama zorunludur."),

  isScrap: z.coerce.boolean().optional().default(false),
  scrapDate: optionalDate,
});

export const updateSubMachineSchema = createSubMachineSchema.extend({
  id: z.coerce.number().int().positive("Geçerli alt makina id zorunludur."),
  subMachineCode: z.string().trim().optional().nullable(),
});
