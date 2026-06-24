// Sistemde kullanılacak tüm özel yetki kodları.
// Role genel erişimi belirler; Permission ise kullanıcıya özel ince ayar yetkileri için kullanılır.
// Örnek: Bir kullanıcı PURCHASING rolünde olabilir ama ayrıca supplier.delete yetkisi olmayabilir.
export const PERMISSIONS = {
  // KULLANICI VE YETKİ YÖNETİMİ

  USER_READ: "user.read",
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",

  USER_PERMISSION_MANAGE: "user.permission.manage",
  USER_ROLE_MANAGE: "user.role.manage",
  USER_SUPER_ADMIN_MANAGE: "user.super_admin.manage",

  // DEPARTMAN YÖNETİMİ

  DEPARTMENT_READ: "department.read",
  DEPARTMENT_CREATE: "department.create",
  DEPARTMENT_UPDATE: "department.update",
  DEPARTMENT_DELETE: "department.delete",

  // PERSONEL YÖNETİMİ

  EMPLOYEE_READ: "employee.read",
  EMPLOYEE_CREATE: "employee.create",
  EMPLOYEE_UPDATE: "employee.update",
  EMPLOYEE_DELETE: "employee.delete",

  // DOKÜMAN YÖNETİMİ

  DOCUMENT_READ: "document.read",
  DOCUMENT_CREATE: "document.create",
  DOCUMENT_DOWNLOAD: "document.download",
  DOCUMENT_DELETE: "document.delete",

  // ONAY YÖNETİMİ

  APPROVAL_READ: "approval.read",
  APPROVAL_CREATE: "approval.create",
  APPROVAL_DECIDE: "approval.decide",
  APPROVAL_CANCEL: "approval.cancel",

  // ATAMA YÖNETİMİ

  ASSIGNMENT_READ: "assignment.read",
  ASSIGNMENT_CREATE: "assignment.create",
  ASSIGNMENT_UPDATE: "assignment.update",
  ASSIGNMENT_DELETE: "assignment.delete",

  // TEDARİKÇİ YÖNETİMİ

  SUPPLIER_READ: "supplier.read",
  SUPPLIER_CREATE: "supplier.create",
  SUPPLIER_UPDATE: "supplier.update",
  SUPPLIER_DELETE: "supplier.delete",

  // ÜRETİM

  PRODUCTION_READ: "production.read",
  PRODUCTION_CREATE: "production.create",
  PRODUCTION_UPDATE: "production.update",
  PRODUCTION_DELETE: "production.delete",
  PRODUCTION_APPROVE: "production.approve",

  // PLANLAMA

  PLANNING_READ: "planning.read",
  PLANNING_CREATE: "planning.create",
  PLANNING_UPDATE: "planning.update",
  PLANNING_DELETE: "planning.delete",
  PLANNING_APPROVE: "planning.approve",

  // BAKIM

  MAINTENANCE_READ: "maintenance.read",
  MAINTENANCE_CREATE: "maintenance.create",
  MAINTENANCE_UPDATE: "maintenance.update",
  MAINTENANCE_DELETE: "maintenance.delete",

  // KALİTE

  QUALITY_READ: "quality.read",
  QUALITY_CREATE: "quality.create",
  QUALITY_UPDATE: "quality.update",
  QUALITY_DELETE: "quality.delete",
  QUALITY_APPROVE: "quality.approve",

  // SEVKİYAT

  SHIPPING_READ: "shipping.read",
  SHIPPING_CREATE: "shipping.create",
  SHIPPING_UPDATE: "shipping.update",
  SHIPPING_DELETE: "shipping.delete",

  // SATIŞ

  SALES_READ: "sales.read",
  SALES_CREATE: "sales.create",
  SALES_UPDATE: "sales.update",
  SALES_DELETE: "sales.delete",
  SALES_APPROVE: "sales.approve",

  // SATINALMA

  PURCHASE_READ: "purchase.read",
  PURCHASE_CREATE: "purchase.create",
  PURCHASE_UPDATE: "purchase.update",
  PURCHASE_DELETE: "purchase.delete",
  PURCHASE_APPROVE: "purchase.approve",

  // HAMMADDE SATINALMA

  RAW_MATERIAL_PURCHASE_READ: "raw_material_purchase.read",
  RAW_MATERIAL_PURCHASE_CREATE: "raw_material_purchase.create",
  RAW_MATERIAL_PURCHASE_UPDATE: "raw_material_purchase.update",
  RAW_MATERIAL_PURCHASE_DELETE: "raw_material_purchase.delete",
  RAW_MATERIAL_PURCHASE_APPROVE: "raw_material_purchase.approve",

  RAW_MATERIAL_PURCHASE_SETTINGS_READ: "raw_material_purchase_settings.read",
  RAW_MATERIAL_PURCHASE_SETTINGS_UPDATE: "raw_material_purchase_settings.update",

  // HAMMADDE / ÜRÜN KARTLARI

  RAW_MATERIAL_READ: "raw_material.read",
  RAW_MATERIAL_CREATE: "raw_material.create",
  RAW_MATERIAL_UPDATE: "raw_material.update",
  RAW_MATERIAL_DELETE: "raw_material.delete",
  RAW_MATERIAL_APPROVE: "raw_material.approve",

  // MUHASEBE

  ACCOUNTING_READ: "accounting.read",
  ACCOUNTING_CREATE: "accounting.create",
  ACCOUNTING_UPDATE: "accounting.update",
  ACCOUNTING_DELETE: "accounting.delete",
  ACCOUNTING_APPROVE: "accounting.approve",

  // FİNANS

  FINANCE_READ: "finance.read",
  FINANCE_CREATE: "finance.create",
  FINANCE_UPDATE: "finance.update",
  FINANCE_DELETE: "finance.delete",
  FINANCE_APPROVE: "finance.approve",

  // DIŞ TİCARET

  FOREIGN_TRADE_READ: "foreign_trade.read",
  FOREIGN_TRADE_CREATE: "foreign_trade.create",
  FOREIGN_TRADE_UPDATE: "foreign_trade.update",
  FOREIGN_TRADE_DELETE: "foreign_trade.delete",
  FOREIGN_TRADE_APPROVE: "foreign_trade.approve",

  // İTHALAT

  IMPORT_READ: "import.read",
  IMPORT_CREATE: "import.create",
  IMPORT_UPDATE: "import.update",
  IMPORT_DELETE: "import.delete",

  // İHRACAT

  EXPORT_READ: "export.read",
  EXPORT_CREATE: "export.create",
  EXPORT_UPDATE: "export.update",
  EXPORT_DELETE: "export.delete",

  // İSG

  OHS_READ: "ohs.read",
  OHS_CREATE: "ohs.create",
  OHS_UPDATE: "ohs.update",
  OHS_DELETE: "ohs.delete",

  // SİSTEM LOGLARI

  SYSTEM_LOG_READ: "system_log.read",
  SYSTEM_LOG_DELETE: "system_log.delete",

  // AUDIT LOGLARI

  AUDIT_LOG_READ: "audit_log.read",
  AUDIT_LOG_DELETE: "audit_log.delete",

  // SİSTEM SAĞLIĞI

  SYSTEM_HEALTH_READ: "system_health.read",
};
