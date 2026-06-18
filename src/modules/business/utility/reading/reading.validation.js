import { z } from "zod";

export const createReadingSchema = z.object({
  meterId: z.string().trim().min(1, "Sayaç zorunludur."),
  readingDate: z.string().trim().min(1, "Okuma tarihi zorunludur."),
  value: z.coerce.number().positive("Sayaç değeri sıfırdan büyük olmalıdır."),
  note: z.string().trim().optional().nullable(),
});

export const updateReadingSchema = z.object({
  readingDate: z.string().trim().optional(),
  value: z.coerce.number().positive("Sayaç değeri sıfırdan büyük olmalıdır.").optional(),
  note: z.string().trim().optional().nullable(),
});
