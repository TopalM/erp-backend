import { z } from "zod";

export const createTradeMarkSchema = z.object({
  tradeMark: z.string().trim().min(1, "Marka adı zorunludur."),
});

export const updateTradeMarkSchema = z.object({
  id: z.coerce.number().int().positive("Geçerli marka id zorunludur."),
  tradeMark: z.string().trim().min(1, "Marka adı zorunludur."),
});

export const deleteTradeMarkSchema = z.object({
  id: z.coerce.number().int().positive("Geçerli marka id zorunludur."),
});
