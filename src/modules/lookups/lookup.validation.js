import { z } from "zod";

export const lookupItemSchema = z.object({
  value: z
    .union([z.string(), z.number()])
    .transform((value) => String(value).trim())
    .refine((value) => value.length > 0, {
      message: "Değer zorunludur.",
    }),

  label: z.string().trim().optional().nullable(),

  extra: z.record(z.string(), z.any()).optional().default({}),

  isActive: z.boolean().optional(),
});
