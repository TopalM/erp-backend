export const PERMISSIONS = {
  USER_READ: "user.read",
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  USER_PERMISSION_MANAGE: "user.permission_manage",
  USER_ROLE_MANAGE: "user.role_manage",
  USER_SUPER_ADMIN_MANAGE: "user.super_admin_manage",

  SUPPLIER_READ: "supplier.read",
  SUPPLIER_CREATE: "supplier.create",
  SUPPLIER_UPDATE: "supplier.update",
  SUPPLIER_DELETE: "supplier.delete",

  RAW_MATERIAL_READ: "raw_material.read",
  RAW_MATERIAL_CREATE: "raw_material.create",
  RAW_MATERIAL_UPDATE: "raw_material.update",
  RAW_MATERIAL_DELETE: "raw_material.delete",
  RAW_MATERIAL_APPROVE: "raw_material.approve",

  RAW_MATERIAL_PURCHASE_READ: "raw_material_purchase.read",
  RAW_MATERIAL_PURCHASE_CREATE: "raw_material_purchase.create",
  RAW_MATERIAL_PURCHASE_UPDATE: "raw_material_purchase.update",
  RAW_MATERIAL_PURCHASE_DELETE: "raw_material_purchase.delete",
  RAW_MATERIAL_PURCHASE_APPROVE: "raw_material_purchase.approve",

  RAW_MATERIAL_PURCHASE_SETTINGS_READ: "raw_material_purchase_settings.read",
  RAW_MATERIAL_PURCHASE_SETTINGS_UPDATE: "raw_material_purchase_settings.update",

  PRODUCTION_READ: "production.read",
  PRODUCTION_CREATE: "production.create",
  PRODUCTION_UPDATE: "production.update",
  PRODUCTION_DELETE: "production.delete",
  PRODUCTION_APPROVE: "production.approve",

  QUALITY_READ: "quality.read",
  QUALITY_CREATE: "quality.create",
  QUALITY_UPDATE: "quality.update",
  QUALITY_DELETE: "quality.delete",
  QUALITY_APPROVE: "quality.approve",

  SHIPMENT_READ: "shipment.read",
  SHIPMENT_CREATE: "shipment.create",
  SHIPMENT_UPDATE: "shipment.update",
  SHIPMENT_DELETE: "shipment.delete",
  SHIPMENT_APPROVE: "shipment.approve",

  FINANCE_READ: "finance.read",
  FINANCE_CREATE: "finance.create",
  FINANCE_UPDATE: "finance.update",
  FINANCE_DELETE: "finance.delete",
  FINANCE_APPROVE: "finance.approve",

  ACCOUNTING_READ: "accounting.read",
  ACCOUNTING_CREATE: "accounting.create",
  ACCOUNTING_UPDATE: "accounting.update",
  ACCOUNTING_DELETE: "accounting.delete",
  ACCOUNTING_APPROVE: "accounting.approve",

  HUMAN_RESOURCE_READ: "human_resource.read",
  HUMAN_RESOURCE_CREATE: "human_resource.create",
  HUMAN_RESOURCE_UPDATE: "human_resource.update",
  HUMAN_RESOURCE_DELETE: "human_resource.delete",
  HUMAN_RESOURCE_APPROVE: "human_resource.approve",

  EMPLOYEE_READ: "employee.read",
  EMPLOYEE_CREATE: "employee.create",
  EMPLOYEE_UPDATE: "employee.update",
  EMPLOYEE_DELETE: "employee.delete",

  MAINTENANCE_READ: "maintenance.read",
  MAINTENANCE_CREATE: "maintenance.create",
  MAINTENANCE_UPDATE: "maintenance.update",
  MAINTENANCE_DELETE: "maintenance.delete",
  MAINTENANCE_APPROVE: "maintenance.approve",

  PLANNING_READ: "planning.read",
  PLANNING_CREATE: "planning.create",
  PLANNING_UPDATE: "planning.update",
  PLANNING_DELETE: "planning.delete",
  PLANNING_APPROVE: "planning.approve",

  SALES_READ: "sales.read",
  SALES_CREATE: "sales.create",
  SALES_UPDATE: "sales.update",
  SALES_DELETE: "sales.delete",
  SALES_APPROVE: "sales.approve",

  PURCHASE_READ: "purchase.read",
  PURCHASE_CREATE: "purchase.create",
  PURCHASE_UPDATE: "purchase.update",
  PURCHASE_DELETE: "purchase.delete",
  PURCHASE_APPROVE: "purchase.approve",

  FOREIGN_TRADE_READ: "foreign_trade.read",
  FOREIGN_TRADE_CREATE: "foreign_trade.create",
  FOREIGN_TRADE_UPDATE: "foreign_trade.update",
  FOREIGN_TRADE_DELETE: "foreign_trade.delete",
  FOREIGN_TRADE_APPROVE: "foreign_trade.approve",

  IMPORT_READ: "import.read",
  IMPORT_CREATE: "import.create",
  IMPORT_UPDATE: "import.update",
  IMPORT_DELETE: "import.delete",

  EXPORT_READ: "export.read",
  EXPORT_CREATE: "export.create",
  EXPORT_UPDATE: "export.update",
  EXPORT_DELETE: "export.delete",

  OHS_READ: "ohs.read",
  OHS_CREATE: "ohs.create",
  OHS_UPDATE: "ohs.update",
  OHS_DELETE: "ohs.delete",
  OHS_APPROVE: "ohs.approve",

  SYSTEM_LOG_READ: "system_log.read",
  SYSTEM_LOG_DELETE: "system_log.delete",

  AUDIT_LOG_READ: "audit_log.read",
  AUDIT_LOG_DELETE: "audit_log.delete",

  SYSTEM_HEALTH_READ: "system_health.read",
};

export const DEFAULT_PERMISSIONS = [
  { code: PERMISSIONS.USER_READ, name: "Okuma" },
  { code: PERMISSIONS.USER_CREATE, name: "Yazma" },
  { code: PERMISSIONS.USER_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.USER_DELETE, name: "Silme" },
  { code: PERMISSIONS.USER_PERMISSION_MANAGE, name: "Yetki Yönetimi" },
  { code: PERMISSIONS.USER_ROLE_MANAGE, name: "Rol Yönetimi" },
  { code: PERMISSIONS.USER_SUPER_ADMIN_MANAGE, name: "Süper Admin Yönetimi" },

  { code: PERMISSIONS.SUPPLIER_READ, name: "Okuma" },
  { code: PERMISSIONS.SUPPLIER_CREATE, name: "Yazma" },
  { code: PERMISSIONS.SUPPLIER_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.SUPPLIER_DELETE, name: "Silme" },

  { code: PERMISSIONS.RAW_MATERIAL_READ, name: "Okuma" },
  { code: PERMISSIONS.RAW_MATERIAL_CREATE, name: "Yazma" },
  { code: PERMISSIONS.RAW_MATERIAL_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.RAW_MATERIAL_DELETE, name: "Silme" },
  { code: PERMISSIONS.RAW_MATERIAL_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.RAW_MATERIAL_PURCHASE_READ, name: "Okuma" },
  { code: PERMISSIONS.RAW_MATERIAL_PURCHASE_CREATE, name: "Yazma" },
  { code: PERMISSIONS.RAW_MATERIAL_PURCHASE_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.RAW_MATERIAL_PURCHASE_DELETE, name: "Silme" },
  { code: PERMISSIONS.RAW_MATERIAL_PURCHASE_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.RAW_MATERIAL_PURCHASE_SETTINGS_READ, name: "Okuma" },
  { code: PERMISSIONS.RAW_MATERIAL_PURCHASE_SETTINGS_UPDATE, name: "Güncelleme" },

  { code: PERMISSIONS.PRODUCTION_READ, name: "Okuma" },
  { code: PERMISSIONS.PRODUCTION_CREATE, name: "Yazma" },
  { code: PERMISSIONS.PRODUCTION_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.PRODUCTION_DELETE, name: "Silme" },
  { code: PERMISSIONS.PRODUCTION_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.QUALITY_READ, name: "Okuma" },
  { code: PERMISSIONS.QUALITY_CREATE, name: "Yazma" },
  { code: PERMISSIONS.QUALITY_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.QUALITY_DELETE, name: "Silme" },
  { code: PERMISSIONS.QUALITY_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.SHIPMENT_READ, name: "Okuma" },
  { code: PERMISSIONS.SHIPMENT_CREATE, name: "Yazma" },
  { code: PERMISSIONS.SHIPMENT_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.SHIPMENT_DELETE, name: "Silme" },
  { code: PERMISSIONS.SHIPMENT_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.FINANCE_READ, name: "Okuma" },
  { code: PERMISSIONS.FINANCE_CREATE, name: "Yazma" },
  { code: PERMISSIONS.FINANCE_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.FINANCE_DELETE, name: "Silme" },
  { code: PERMISSIONS.FINANCE_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.ACCOUNTING_READ, name: "Okuma" },
  { code: PERMISSIONS.ACCOUNTING_CREATE, name: "Yazma" },
  { code: PERMISSIONS.ACCOUNTING_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.ACCOUNTING_DELETE, name: "Silme" },
  { code: PERMISSIONS.ACCOUNTING_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.HUMAN_RESOURCE_READ, name: "Okuma" },
  { code: PERMISSIONS.HUMAN_RESOURCE_CREATE, name: "Yazma" },
  { code: PERMISSIONS.HUMAN_RESOURCE_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.HUMAN_RESOURCE_DELETE, name: "Silme" },
  { code: PERMISSIONS.HUMAN_RESOURCE_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.EMPLOYEE_READ, name: "Okuma" },
  { code: PERMISSIONS.EMPLOYEE_CREATE, name: "Yazma" },
  { code: PERMISSIONS.EMPLOYEE_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.EMPLOYEE_DELETE, name: "Silme" },

  { code: PERMISSIONS.MAINTENANCE_READ, name: "Okuma" },
  { code: PERMISSIONS.MAINTENANCE_CREATE, name: "Yazma" },
  { code: PERMISSIONS.MAINTENANCE_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.MAINTENANCE_DELETE, name: "Silme" },
  { code: PERMISSIONS.MAINTENANCE_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.PLANNING_READ, name: "Okuma" },
  { code: PERMISSIONS.PLANNING_CREATE, name: "Yazma" },
  { code: PERMISSIONS.PLANNING_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.PLANNING_DELETE, name: "Silme" },
  { code: PERMISSIONS.PLANNING_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.SALES_READ, name: "Okuma" },
  { code: PERMISSIONS.SALES_CREATE, name: "Yazma" },
  { code: PERMISSIONS.SALES_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.SALES_DELETE, name: "Silme" },
  { code: PERMISSIONS.SALES_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.PURCHASE_READ, name: "Okuma" },
  { code: PERMISSIONS.PURCHASE_CREATE, name: "Yazma" },
  { code: PERMISSIONS.PURCHASE_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.PURCHASE_DELETE, name: "Silme" },
  { code: PERMISSIONS.PURCHASE_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.FOREIGN_TRADE_READ, name: "Okuma" },
  { code: PERMISSIONS.FOREIGN_TRADE_CREATE, name: "Yazma" },
  { code: PERMISSIONS.FOREIGN_TRADE_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.FOREIGN_TRADE_DELETE, name: "Silme" },
  { code: PERMISSIONS.FOREIGN_TRADE_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.IMPORT_READ, name: "Okuma" },
  { code: PERMISSIONS.IMPORT_CREATE, name: "Yazma" },
  { code: PERMISSIONS.IMPORT_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.IMPORT_DELETE, name: "Silme" },

  { code: PERMISSIONS.EXPORT_READ, name: "Okuma" },
  { code: PERMISSIONS.EXPORT_CREATE, name: "Yazma" },
  { code: PERMISSIONS.EXPORT_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.EXPORT_DELETE, name: "Silme" },

  { code: PERMISSIONS.OHS_READ, name: "Okuma" },
  { code: PERMISSIONS.OHS_CREATE, name: "Yazma" },
  { code: PERMISSIONS.OHS_UPDATE, name: "Güncelleme" },
  { code: PERMISSIONS.OHS_DELETE, name: "Silme" },
  { code: PERMISSIONS.OHS_APPROVE, name: "Onaylama" },

  { code: PERMISSIONS.SYSTEM_LOG_READ, name: "Okuma" },
  { code: PERMISSIONS.SYSTEM_LOG_DELETE, name: "Silme" },

  { code: PERMISSIONS.AUDIT_LOG_READ, name: "Okuma" },
  { code: PERMISSIONS.AUDIT_LOG_DELETE, name: "Silme" },

  { code: PERMISSIONS.SYSTEM_HEALTH_READ, name: "Okuma" },
];
