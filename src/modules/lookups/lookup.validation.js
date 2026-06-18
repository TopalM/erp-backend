import { z } from "zod";

// Lookup kayıt oluşturma ve güncelleme body validasyonu.
// value zorunludur.
// label opsiyoneldir; gönderilmezse service tarafında value kullanılır.
// extra alanı cityId, countryId, sortOrder gibi gruba özel ek değerler için kullanılır.
// isActive aktif/pasif durumunu belirler.
export const lookupItemSchema = z.object({
  value: z.string().trim().min(1, "Değer zorunludur."),
  label: z.string().trim().optional().nullable(),
  legacyId: z.union([z.number(), z.string()]).optional().nullable(),
  extra: z.record(z.any()).optional().default({}),
  isActive: z.boolean().optional(),
});
