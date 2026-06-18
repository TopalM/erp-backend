// Sistemdeki tüm roller.
// Role, kullanıcının organizasyondaki pozisyonunu/seviyesini belirtir.
// Asıl ekran ve işlem yetkileri Permission üzerinden tek tek yönetilir.
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN", // Tüm sistemsel yetkilere sahip en üst seviye kullanıcı

  ADMIN: "ADMIN", // Genel sistem yöneticisi
  TOP_MANAGEMENT: "TOP_MANAGEMENT", // Üst yönetim

  PRODUCTION_RESPONSIBLE: "PRODUCTION_RESPONSIBLE", // Üretim sorumlusu
  PRODUCTION_MANAGER: "PRODUCTION_MANAGER", // Üretim müdürü

  MAINTENANCE_RESPONSIBLE: "MAINTENANCE_RESPONSIBLE", // Bakım sorumlusu
  MAINTENANCE_MANAGER: "MAINTENANCE_MANAGER", // Bakım müdürü

  PLANNING_RESPONSIBLE: "PLANNING_RESPONSIBLE", // Planlama sorumlusu
  PLANNING_MANAGER: "PLANNING_MANAGER", // Planlama müdürü

  SHIPPING_RESPONSIBLE: "SHIPPING_RESPONSIBLE", // Sevkiyat sorumlusu
  SHIPPING_MANAGER: "SHIPPING_MANAGER", // Sevkiyat müdürü

  FOREIGN_TRADE_RESPONSIBLE: "FOREIGN_TRADE_RESPONSIBLE", // Dış ticaret sorumlusu
  FOREIGN_TRADE_MANAGER: "FOREIGN_TRADE_MANAGER", // Dış ticaret müdürü

  SALES_RESPONSIBLE: "SALES_RESPONSIBLE", // Satış sorumlusu
  SALES_MANAGER: "SALES_MANAGER", // Satış müdürü

  PURCHASING_RESPONSIBLE: "PURCHASING_RESPONSIBLE", // Satınalma sorumlusu
  PURCHASING_MANAGER: "PURCHASING_MANAGER", // Satınalma müdürü

  QUALITY_RESPONSIBLE: "QUALITY_RESPONSIBLE", // Kalite sorumlusu
  QUALITY_MANAGER: "QUALITY_MANAGER", // Kalite müdürü

  OHS_RESPONSIBLE: "OHS_RESPONSIBLE", // İSG sorumlusu
  OHS_MANAGER: "OHS_MANAGER", // İSG müdürü

  ACCOUNTING_RESPONSIBLE: "ACCOUNTING_RESPONSIBLE", // Muhasebe sorumlusu
  ACCOUNTING_MANAGER: "ACCOUNTING_MANAGER", // Muhasebe müdürü

  FINANCE_RESPONSIBLE: "FINANCE_RESPONSIBLE", // Finans sorumlusu
  FINANCE_MANAGER: "FINANCE_MANAGER", // Finans müdürü

  HUMAN_RESOURCES: "HUMAN_RESOURCES", // İnsan kaynakları

  VIEWER: "VIEWER", // Varsayılan görüntüleyici rol
};

// Sistemde seedlenecek / kullanılacak tüm rollerin listesi.
export const DEFAULT_ROLE_LIST = Object.values(ROLES);

// Sistem seviyesindeki roller.
// Genellikle auth log, audit log, sistem ayarları gibi kritik alanlarda kullanılır.
export const SYSTEM_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

// Müdür / yönetici seviyesindeki roller.
export const MANAGEMENT_ROLES = [
  ROLES.TOP_MANAGEMENT,

  ROLES.PRODUCTION_MANAGER,
  ROLES.MAINTENANCE_MANAGER,
  ROLES.PLANNING_MANAGER,
  ROLES.SHIPPING_MANAGER,
  ROLES.FOREIGN_TRADE_MANAGER,
  ROLES.SALES_MANAGER,
  ROLES.PURCHASING_MANAGER,
  ROLES.QUALITY_MANAGER,
  ROLES.OHS_MANAGER,
  ROLES.ACCOUNTING_MANAGER,
  ROLES.FINANCE_MANAGER,
];

// Sorumlu / operasyonel seviye roller.
export const RESPONSIBLE_ROLES = [
  ROLES.PRODUCTION_RESPONSIBLE,
  ROLES.MAINTENANCE_RESPONSIBLE,
  ROLES.PLANNING_RESPONSIBLE,
  ROLES.SHIPPING_RESPONSIBLE,
  ROLES.FOREIGN_TRADE_RESPONSIBLE,
  ROLES.SALES_RESPONSIBLE,
  ROLES.PURCHASING_RESPONSIBLE,
  ROLES.QUALITY_RESPONSIBLE,
  ROLES.OHS_RESPONSIBLE,
  ROLES.ACCOUNTING_RESPONSIBLE,
  ROLES.FINANCE_RESPONSIBLE,
];

// Role kodlarının kullanıcıya gösterilecek Türkçe karşılıkları.
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Süper Admin",

  [ROLES.ADMIN]: "Admin",
  [ROLES.TOP_MANAGEMENT]: "Üst Yönetim",

  [ROLES.PRODUCTION_RESPONSIBLE]: "Üretim Sorumlusu",
  [ROLES.PRODUCTION_MANAGER]: "Üretim Müdürü",

  [ROLES.MAINTENANCE_RESPONSIBLE]: "Bakım Sorumlusu",
  [ROLES.MAINTENANCE_MANAGER]: "Bakım Müdürü",

  [ROLES.PLANNING_RESPONSIBLE]: "Planlama Sorumlusu",
  [ROLES.PLANNING_MANAGER]: "Planlama Müdürü",

  [ROLES.SHIPPING_RESPONSIBLE]: "Sevkiyat Sorumlusu",
  [ROLES.SHIPPING_MANAGER]: "Sevkiyat Müdürü",

  [ROLES.FOREIGN_TRADE_RESPONSIBLE]: "Dış Ticaret Sorumlusu",
  [ROLES.FOREIGN_TRADE_MANAGER]: "Dış Ticaret Müdürü",

  [ROLES.SALES_RESPONSIBLE]: "Satış Sorumlusu",
  [ROLES.SALES_MANAGER]: "Satış Müdürü",

  [ROLES.PURCHASING_RESPONSIBLE]: "Satınalma Sorumlusu",
  [ROLES.PURCHASING_MANAGER]: "Satınalma Müdürü",

  [ROLES.QUALITY_RESPONSIBLE]: "Kalite Sorumlusu",
  [ROLES.QUALITY_MANAGER]: "Kalite Müdürü",

  [ROLES.OHS_RESPONSIBLE]: "İSG Sorumlusu",
  [ROLES.OHS_MANAGER]: "İSG Müdürü",

  [ROLES.ACCOUNTING_RESPONSIBLE]: "Muhasebe Sorumlusu",
  [ROLES.ACCOUNTING_MANAGER]: "Muhasebe Müdürü",

  [ROLES.FINANCE_RESPONSIBLE]: "Finans Sorumlusu",
  [ROLES.FINANCE_MANAGER]: "Finans Müdürü",

  [ROLES.HUMAN_RESOURCES]: "İnsan Kaynakları",

  [ROLES.VIEWER]: "Görüntüleyici",
};
