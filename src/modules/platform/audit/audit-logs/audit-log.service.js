import { prisma } from "../../../../database/prisma.client.js";

// Sistem içerisinde yapılan kritik işlemleri kayıt altına alır.
// Kim ne yaptı, hangi modülde yaptı, hangi kaydı etkiledi
// ve hangi veriyi değiştirdi gibi bilgileri AuditLog tablosuna kaydeder.
export const createAuditLog = async ({
  actorUser = null,
  targetUser = null,
  entityType = "SYSTEM",
  entityId = null,
  action = "ERROR",
  message = null,
  oldValue = null,
  newValue = null,
  req = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        // İşlemi yapan kullanıcı bilgileri
        actorUserId: actorUser?.id || null,
        actorEmail: actorUser?.email || null,

        // İşlem yapılan modül / kayıt / aksiyon bilgileri
        entityType,
        entityId,
        action,
        message,

        // Değişiklik öncesi ve sonrası veri
        oldValue,
        newValue,

        // İstek bilgileri
        ipAddress: req?.ip || null,
        userAgent: req?.headers?.["user-agent"] || null,
      },
    });
  } catch (error) {
    // Audit log yazılamasa bile ana işlem başarısız olmamalıdır.
    console.error("Audit log could not be created:", error);
  }
};
