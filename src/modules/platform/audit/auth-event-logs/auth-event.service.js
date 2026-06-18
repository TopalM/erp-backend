import { prisma } from "../../../../database/prisma.client.js";

// Sistemde oluşabilecek tüm kimlik doğrulama olayları.
// AuthEventLog tablosuna kayıt atarken standart event isimleri kullanılır.
// Böylece string hataları ve yazım farklılıkları engellenmiş olur.
export const AUTH_EVENTS = {
  REGISTER_SUCCESS: "REGISTER_SUCCESS", // Kullanıcı başarıyla kayıt oldu

  LOGIN_SUCCESS: "LOGIN_SUCCESS", // Başarılı giriş yapıldı
  LOGIN_FAILED: "LOGIN_FAILED", // Başarısız giriş denemesi
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED", // Çok fazla başarısız giriş nedeniyle hesap kilitlendi
  LOGOUT: "LOGOUT", // Kullanıcı sistemden çıkış yaptı

  PASSWORD_CHANGED: "PASSWORD_CHANGED", // Kullanıcı mevcut şifresini değiştirdi
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED", // Şifre sıfırlama talebi oluşturuldu
  PASSWORD_RESET_COMPLETED: "PASSWORD_RESET_COMPLETED", // Şifre sıfırlama işlemi tamamlandı

  EMAIL_VERIFICATION_SENT: "EMAIL_VERIFICATION_SENT", // Email doğrulama bağlantısı gönderildi
  EMAIL_VERIFIED: "EMAIL_VERIFIED", // Email doğrulaması başarıyla tamamlandı
  EMAIL_VERIFICATION_FAILED: "EMAIL_VERIFICATION_FAILED", // Geçersiz veya süresi dolmuş email doğrulama denemesi
};

// Auth işlemleri sırasında log kaydı oluşturur.
// Login, logout, register, şifre sıfırlama, email doğrulama gibi tüm
// güvenlik olayları bu fonksiyon üzerinden merkezi olarak kaydedilir.
export const createAuthEventLog = async ({ userId = null, email = null, event, success = false, message = null, req = null }) => {
  try {
    let safeUserId = null;

    // userId geldiyse ilgili kullanıcı gerçekten var mı kontrol edilir.
    // Böylece test cleanup, rollback veya silinmiş kullanıcı durumlarında
    // AuthEventLog_userId_fkey hatası oluşmaz.
    if (userId) {
      const existingUser = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      });

      safeUserId = existingUser?.id || null;
    }

    await prisma.authEventLog.create({
      data: {
        userId: safeUserId, // İşlemi yapan kullanıcı id'si mevcutsa yazılır

        email, // İşlem sırasında kullanılan email adresi

        event, // Gerçekleşen auth olayı

        success, // İşlem başarılı mı?

        message, // Açıklama veya hata mesajı

        ipAddress: req?.ip || null, // İsteğin geldiği IP adresi

        userAgent: req?.headers?.["user-agent"] || null, // Tarayıcı, cihaz ve işletim sistemi bilgisi
      },
    });
  } catch (error) {
    // Auth log oluşturulamadığında sistemin çalışması durmamalıdır.
    // Log yazılamasa bile login/register gibi işlemler devam eder.
    console.error("Auth event log could not be created:", error);
  }
};
