import { z } from "zod";

// Rol oluşturma validasyonu.
// name: sistemde kullanılan rol adı.
// Örnek: ADMIN, VIEWER, PURCHASING_MANAGER
export const createRoleSchema = z.object({
  name: z.string().trim().min(1, "Rol adı zorunludur."),
});

// Rol güncelleme validasyonu.
// Şimdilik sadece name güncellenebilir.
export const updateRoleSchema = createRoleSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "Güncellenecek en az bir alan gönderilmelidir.",
});
