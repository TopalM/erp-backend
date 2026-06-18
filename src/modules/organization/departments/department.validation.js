import { z } from "zod";

// Departman oluşturma validasyonu.
export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1, "Departman adı zorunludur."),
  code: z.string().trim().min(1, "Departman kodu zorunludur."),
});

// Departman güncelleme validasyonu.
// name veya code tek başına güncellenebilir.
// Ancak boş body kabul edilmez.
export const updateDepartmentSchema = createDepartmentSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "Güncellenecek en az bir alan gönderilmelidir.",
});
