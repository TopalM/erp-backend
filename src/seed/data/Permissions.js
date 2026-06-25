import { PERMISSIONS } from "../../constants/permissions.js";

const permissionNameMap = {
  read: "Okuma",
  create: "Oluşturma",
  update: "Güncelleme",
  delete: "Silme",
  approve: "Onaylama",
  manage: "Yönetim",
  decide: "Karar Verme",
  cancel: "İptal Etme",
};

const specialPermissionNames = {
  [PERMISSIONS.USER_PERMISSION_MANAGE]: "Kullanıcı Yetki Yönetimi",
  [PERMISSIONS.USER_ROLE_MANAGE]: "Kullanıcı Rol Yönetimi",
  [PERMISSIONS.USER_SUPER_ADMIN_MANAGE]: "Süper Admin Yönetimi",

  [PERMISSIONS.RAW_MATERIAL_PURCHASE_SETTINGS_READ]: "Hammadde Satınalma Ayarları Okuma",
  [PERMISSIONS.RAW_MATERIAL_PURCHASE_SETTINGS_UPDATE]: "Hammadde Satınalma Ayarları Güncelleme",

  [PERMISSIONS.APPROVAL_DECIDE]: "Onay Kararı Verme",
  [PERMISSIONS.APPROVAL_CANCEL]: "Onay Süreci İptal Etme",

  [PERMISSIONS.ASSIGNMENT_READ]: "Atama Okuma",
  [PERMISSIONS.ASSIGNMENT_CREATE]: "Atama Oluşturma",
  [PERMISSIONS.ASSIGNMENT_UPDATE]: "Atama Güncelleme",
  [PERMISSIONS.ASSIGNMENT_DELETE]: "Atama Silme",

  [PERMISSIONS.DOCUMENT_DOWNLOAD]: "Doküman İndirme",

  [PERMISSIONS.SYSTEM_HEALTH_READ]: "Sistem Sağlığı Görüntüleme",
  [PERMISSIONS.SYSTEM_LOG_READ]: "Sistem Logları Görüntüleme",
  [PERMISSIONS.SYSTEM_LOG_DELETE]: "Sistem Logları Silme",
  [PERMISSIONS.AUDIT_LOG_READ]: "Audit Logları Görüntüleme",
  [PERMISSIONS.AUDIT_LOG_DELETE]: "Audit Logları Silme",
};

const formatModuleName = (moduleName) => {
  return moduleName
    .split("_")
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR") + part.slice(1).toLocaleLowerCase("tr-TR"))
    .join(" ");
};

const getPermissionName = (code) => {
  if (specialPermissionNames[code]) {
    return specialPermissionNames[code];
  }

  const parts = code.split(".");
  const action = parts.at(-1);
  const moduleName = parts.slice(0, -1).join("_");

  const moduleLabel = formatModuleName(moduleName);
  const actionLabel = permissionNameMap[action] || action;

  return `${moduleLabel} ${actionLabel}`;
};

export const DEFAULT_PERMISSIONS = Object.values(PERMISSIONS).map((code) => ({
  code,
  name: getPermissionName(code),
}));
