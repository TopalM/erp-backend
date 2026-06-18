import { z } from "zod";

// Yeni yetki oluşturma validasyonu.
// code: sistem içinde kullanılan benzersiz kod. Örn: supplier.read, user.create
// name: kullanıcıya gösterilecek yetki adı.
// description: opsiyonel açıklama.
export const createPermissionSchema = z.object({
  code: z.string().trim().min(1, "Yetki kodu zorunludur."),
  name: z.string().trim().min(1, "Yetki adı zorunludur."),
  description: z.string().trim().optional().nullable(),
});

// Yetki güncelleme validasyonu.
// code, name veya description tek başına güncellenebilir.
// Ancak tamamen boş body kabul edilmez.
export const updatePermissionSchema = createPermissionSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "Güncellenecek en az bir alan gönderilmelidir.",
});

// Kullanıcıya özel yetki atama validasyonu.
// permissions boş array olabilir; bu durumda kullanıcının özel yetkileri temizlenir.
// permissionId için cuid zorunluluğu bırakıyoruz çünkü gerçek Permission id'leri cuid.
export const updateUserPermissionsSchema = z.object({
  permissions: z
    .array(
      z.object({
        permissionId: z.string().cuid("Geçerli yetki id zorunludur."),
        effect: z.enum(["ALLOW", "DENY"], {
          error: "Yetki etkisi ALLOW veya DENY olmalıdır.",
        }),
      }),
    )
    .default([]),
});
