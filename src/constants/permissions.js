// Sistemde kullanılacak tüm özel yetki kodları.
// Role genel erişimi belirler; Permission ise kullanıcıya özel ince ayar yetkileri için kullanılır.
// Örnek: Bir kullanıcı PURCHASING rolünde olabilir ama ayrıca supplier.delete yetkisi olmayabilir.
export const PERMISSIONS = {
  // KULLANICI VE YETKİ YÖNETİMİ

  USER_READ: "user.read", // Kullanıcıları görüntüleme
  USER_CREATE: "user.create", // Kullanıcı oluşturma
  USER_UPDATE: "user.update", // Kullanıcı güncelleme
  USER_DELETE: "user.delete", // Kullanıcı silme / pasife alma

  USER_PERMISSION_MANAGE: "user.permission.manage", // Kullanıcı özel yetkilerini yönetme
  USER_ROLE_MANAGE: "user.role.manage", // Kullanıcı rolünü değiştirme
  USER_SUPER_ADMIN_MANAGE: "user.super_admin.manage", // Süper admin atama / kaldırma

  // PERSONEL YÖNETİMİ

  EMPLOYEE_READ: "employee.read", // Personel görüntüleme
  EMPLOYEE_CREATE: "employee.create", // Personel oluşturma
  EMPLOYEE_UPDATE: "employee.update", // Personel güncelleme
  EMPLOYEE_DELETE: "employee.delete", // Personel silme / pasife alma

  // TEDARİKÇİ YÖNETİMİ

  SUPPLIER_READ: "supplier.read", // Tedarikçi görüntüleme
  SUPPLIER_CREATE: "supplier.create", // Tedarikçi oluşturma
  SUPPLIER_UPDATE: "supplier.update", // Tedarikçi güncelleme
  SUPPLIER_DELETE: "supplier.delete", // Tedarikçi silme / pasife alma

  // ÜRETİM

  PRODUCTION_READ: "production.read", // Üretim kayıtlarını görüntüleme
  PRODUCTION_CREATE: "production.create", // Üretim kaydı oluşturma
  PRODUCTION_UPDATE: "production.update", // Üretim kaydı güncelleme
  PRODUCTION_DELETE: "production.delete", // Üretim kaydı silme
  PRODUCTION_APPROVE: "production.approve", // Üretim onaylama

  // PLANLAMA

  PLANNING_READ: "planning.read", // Planlama kayıtlarını görüntüleme
  PLANNING_CREATE: "planning.create", // Plan oluşturma
  PLANNING_UPDATE: "planning.update", // Plan güncelleme
  PLANNING_DELETE: "planning.delete", // Plan silme
  PLANNING_APPROVE: "planning.approve", // Plan onaylama

  // BAKIM

  MAINTENANCE_READ: "maintenance.read", // Bakım kayıtlarını görüntüleme
  MAINTENANCE_CREATE: "maintenance.create", // Bakım kaydı oluşturma
  MAINTENANCE_UPDATE: "maintenance.update", // Bakım kaydı güncelleme
  MAINTENANCE_DELETE: "maintenance.delete", // Bakım kaydı silme

  // KALİTE

  QUALITY_READ: "quality.read", // Kalite kayıtlarını görüntüleme
  QUALITY_CREATE: "quality.create", // Kalite kaydı oluşturma
  QUALITY_UPDATE: "quality.update", // Kalite kaydı güncelleme
  QUALITY_DELETE: "quality.delete", // Kalite kaydı silme
  QUALITY_APPROVE: "quality.approve", // Kalite onaylama

  // SEVKİYAT

  SHIPPING_READ: "shipping.read", // Sevkiyat kayıtlarını görüntüleme
  SHIPPING_CREATE: "shipping.create", // Sevkiyat kaydı oluşturma
  SHIPPING_UPDATE: "shipping.update", // Sevkiyat kaydı güncelleme
  SHIPPING_DELETE: "shipping.delete", // Sevkiyat kaydı silme

  // SATIŞ

  SALES_READ: "sales.read", // Satış kayıtlarını görüntüleme
  SALES_CREATE: "sales.create", // Satış kaydı oluşturma
  SALES_UPDATE: "sales.update", // Satış kaydı güncelleme
  SALES_DELETE: "sales.delete", // Satış kaydı silme
  SALES_APPROVE: "sales.approve", // Satış onaylama

  // SATINALMA

  PURCHASE_READ: "purchase.read", // Satınalma kayıtlarını görüntüleme
  PURCHASE_CREATE: "purchase.create", // Satınalma oluşturma
  PURCHASE_UPDATE: "purchase.update", // Satınalma güncelleme
  PURCHASE_DELETE: "purchase.delete", // Satınalma silme
  PURCHASE_APPROVE: "purchase.approve", // Satınalma onaylama

  // HAMMADDE SATINALMA

  RAW_MATERIAL_PURCHASE_READ: "raw_material_purchase.read", // Hammadde satınalma görüntüleme
  RAW_MATERIAL_PURCHASE_CREATE: "raw_material_purchase.create", // Hammadde satınalma oluşturma
  RAW_MATERIAL_PURCHASE_UPDATE: "raw_material_purchase.update", // Hammadde satınalma güncelleme
  RAW_MATERIAL_PURCHASE_DELETE: "raw_material_purchase.delete", // Hammadde satınalma silme
  RAW_MATERIAL_PURCHASE_APPROVE: "raw_material_purchase.approve", // Hammadde satınalma onaylama

  RAW_MATERIAL_PURCHASE_SETTINGS_READ: "raw_material_purchase_settings.read", // Hammadde satınalma ayarlarını görüntüleme
  RAW_MATERIAL_PURCHASE_SETTINGS_UPDATE: "raw_material_purchase_settings.update", // Hammadde satınalma ayarlarını güncelleme

  // HAMMADDE / ÜRÜN KARTLARI

  RAW_MATERIAL_READ: "raw_material.read", // Hammadde/ürün görüntüleme
  RAW_MATERIAL_CREATE: "raw_material.create", // Hammadde/ürün oluşturma
  RAW_MATERIAL_UPDATE: "raw_material.update", // Hammadde/ürün güncelleme
  RAW_MATERIAL_DELETE: "raw_material.delete", // Hammadde/ürün silme
  RAW_MATERIAL_APPROVE: "raw_material.approve", // Hammadde/ürün onaylama

  // MUHASEBE

  ACCOUNTING_READ: "accounting.read", // Muhasebe kayıtlarını görüntüleme
  ACCOUNTING_CREATE: "accounting.create", // Muhasebe kaydı oluşturma
  ACCOUNTING_UPDATE: "accounting.update", // Muhasebe kaydı güncelleme
  ACCOUNTING_DELETE: "accounting.delete", // Muhasebe kaydı silme
  ACCOUNTING_APPROVE: "accounting.approve", // Muhasebe onaylama

  // FİNANS

  FINANCE_READ: "finance.read", // Finans kayıtlarını görüntüleme
  FINANCE_CREATE: "finance.create", // Finans kaydı oluşturma
  FINANCE_UPDATE: "finance.update", // Finans kaydı güncelleme
  FINANCE_DELETE: "finance.delete", // Finans kaydı silme
  FINANCE_APPROVE: "finance.approve", // Finans onaylama

  // DIŞ TİCARET

  FOREIGN_TRADE_READ: "foreign_trade.read", // Dış ticaret kayıtlarını görüntüleme
  FOREIGN_TRADE_CREATE: "foreign_trade.create", // Dış ticaret kaydı oluşturma
  FOREIGN_TRADE_UPDATE: "foreign_trade.update", // Dış ticaret kaydı güncelleme
  FOREIGN_TRADE_DELETE: "foreign_trade.delete", // Dış ticaret kaydı silme
  FOREIGN_TRADE_APPROVE: "foreign_trade.approve", // Dış ticaret onaylama

  // İTHALAT

  IMPORT_READ: "import.read", // İthalat kayıtlarını görüntüleme
  IMPORT_CREATE: "import.create", // İthalat kaydı oluşturma
  IMPORT_UPDATE: "import.update", // İthalat kaydı güncelleme
  IMPORT_DELETE: "import.delete", // İthalat kaydı silme

  // İHRACAT

  EXPORT_READ: "export.read", // İhracat kayıtlarını görüntüleme
  EXPORT_CREATE: "export.create", // İhracat kaydı oluşturma
  EXPORT_UPDATE: "export.update", // İhracat kaydı güncelleme
  EXPORT_DELETE: "export.delete", // İhracat kaydı silme

  // İSG

  OHS_READ: "ohs.read", // İSG kayıtlarını görüntüleme
  OHS_CREATE: "ohs.create", // İSG kaydı oluşturma
  OHS_UPDATE: "ohs.update", // İSG kaydı güncelleme
  OHS_DELETE: "ohs.delete", // İSG kaydı silme

  // SİSTEM LOGLARI

  SYSTEM_LOG_READ: "system_log.read", // Sistem loglarını görüntüleme
  SYSTEM_LOG_DELETE: "system_log.delete", // Sistem loglarını temizleme

  // AUDIT LOGLARI

  AUDIT_LOG_READ: "audit_log.read", // Audit loglarını görüntüleme
  AUDIT_LOG_DELETE: "audit_log.delete", // Audit loglarını temizleme

  // SİSTEM SAĞLIĞI

  SYSTEM_HEALTH_READ: "system_health.read", // Sistem sağlık durumunu görüntüleme
};
