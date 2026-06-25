import path from "path";

import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/appError.js";

import { buildStoragePath, ensureStorageFolder, uploadFile, getDownloadUrl } from "../storage/index.js";
import { cleanupLocalFile, cleanupStorageResources } from "../storage/storage.cleanup.js";

const DOCUMENT_MODULES = [
  "PURCHASING",
  "SUPPLIER",
  "QUALITY",
  "PRODUCTION",
  "SHIPMENT",
  "MAINTENANCE",
  "EMPLOYEE",
  "ACCOUNTING",
  "UTILITY",
  "SYSTEM",
];

const DOCUMENT_ENTITY_TYPES = [
  "VENDOR_INVOICE",
  "PURCHASE_REQUEST",
  "PURCHASE_ORDER",
  "SUPPLIER",
  "SUPPLIER_DOCUMENT",
  "QUALITY_INSPECTION",
  "QUALITY_CERTIFICATE",
  "QUALITY_DEVIATION",
  "PRODUCTION_ORDER",
  "PRODUCTION_BATCH",
  "SHIPMENT_PLAN",
  "DISPATCH_NOTE",
  "MAINTENANCE",
  "EQUIPMENT",
  "EMPLOYEE",
  "UTILITY_READING",
  "OTHER",
];

const DOCUMENT_TYPES = [
  "INVOICE",
  "ISO_9001",
  "ISO_14001",
  "ISO_45001",
  "ISO_50001",
  "COA",
  "SDS",
  "TDS",
  "ANALYSIS_REPORT",
  "DELIVERY_NOTE",
  "PACKING_LIST",
  "MAINTENANCE_FORM",
  "EMPLOYEE_DOCUMENT",
  "UTILITY_REPORT",
  "OTHER",
];

const MODULE_READ_PERMISSION_MAP = {
  PURCHASING: "purchase.read",
  SUPPLIER: "supplier.read",
  QUALITY: "quality.read",
  PRODUCTION: "production.read",
  SHIPMENT: "shipping.read",
  MAINTENANCE: "maintenance.read",
  EMPLOYEE: "employee.read",
  ACCOUNTING: "accounting.read",
  UTILITY: "system_health.read",
  SYSTEM: "system_log.read",
};

const MODULE_CREATE_PERMISSION_MAP = {
  PURCHASING: "purchase.create",
  SUPPLIER: "supplier.create",
  QUALITY: "quality.create",
  PRODUCTION: "production.create",
  SHIPMENT: "shipping.create",
  MAINTENANCE: "maintenance.create",
  EMPLOYEE: "employee.create",
  ACCOUNTING: "accounting.create",
  UTILITY: "system_health.read",
  SYSTEM: "system_log.read",
};

const MODULE_DELETE_PERMISSION_MAP = {
  PURCHASING: "purchase.delete",
  SUPPLIER: "supplier.delete",
  QUALITY: "quality.delete",
  PRODUCTION: "production.delete",
  SHIPMENT: "shipping.delete",
  MAINTENANCE: "maintenance.delete",
  EMPLOYEE: "employee.delete",
  ACCOUNTING: "accounting.delete",
  UTILITY: "system_health.read",
  SYSTEM: "system_log.delete",
};

const documentInclude = {
  uploadedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

const assertEnumValue = (value, allowedValues, fieldName) => {
  if (value && !allowedValues.includes(value)) {
    throw new AppError(`${fieldName} geçersiz.`, 400);
  }
};

function normalizeStoragePart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ.-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeFileName(filename = "document") {
  const extension = path.extname(filename || "").toLowerCase();

  const baseName = path
    .basename(filename || "document", extension)
    .replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ._ -]/g, "-")
    .replace(/\.+/g, ".")
    .replace(/-+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[-. ]+|[-. ]+$/g, "")
    .slice(0, 60);

  return `${baseName || "document"}${extension}`;
}

function createStoredFileName(file) {
  const safeFileName = sanitizeFileName(file.originalname || "document");

  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeFileName}`;
}

function isAdminLike(user) {
  return user?.role?.name === "SUPER_ADMIN" || user?.role?.name === "ADMIN";
}

function getUserPermissionCodes(user) {
  return user?.userPermissions?.map((item) => item?.permission?.code).filter(Boolean) || [];
}

function assertDocumentAccess(user, document) {
  if (isAdminLike(user)) return;

  const requiredPermission = MODULE_READ_PERMISSION_MAP[document.module];

  if (!requiredPermission) {
    throw new AppError("Bu doküman modülü için erişim kuralı tanımlı değil.", 403);
  }

  const userPermissionCodes = getUserPermissionCodes(user);

  if (!userPermissionCodes.includes(requiredPermission)) {
    throw new AppError("Bu dokümana erişim yetkiniz yok.", 403);
  }
}

function assertDocumentCreateAccess(user, module) {
  if (isAdminLike(user)) return;

  const requiredPermission = MODULE_CREATE_PERMISSION_MAP[module];

  if (!requiredPermission) {
    throw new AppError("Bu doküman modülü için oluşturma kuralı tanımlı değil.", 403);
  }

  const userPermissionCodes = getUserPermissionCodes(user);

  if (!userPermissionCodes.includes(requiredPermission)) {
    throw new AppError("Bu modüle doküman yükleme yetkiniz yok.", 403);
  }
}

function assertDocumentDeleteAccess(user, document) {
  if (isAdminLike(user)) return;

  const requiredPermission = MODULE_DELETE_PERMISSION_MAP[document.module];

  if (!requiredPermission) {
    throw new AppError("Bu doküman modülü için silme kuralı tanımlı değil.", 403);
  }

  const userPermissionCodes = getUserPermissionCodes(user);

  if (!userPermissionCodes.includes(requiredPermission)) {
    throw new AppError("Bu dokümanı silme yetkiniz yok.", 403);
  }
}

function buildDocumentScopeWhere(user) {
  if (isAdminLike(user)) return {};

  const userPermissionCodes = getUserPermissionCodes(user);

  const allowedModules = Object.entries(MODULE_READ_PERMISSION_MAP)
    .filter(([, permissionCode]) => userPermissionCodes.includes(permissionCode))
    .map(([module]) => module);

  if (allowedModules.length === 0) {
    return {
      id: "__NO_DOCUMENT_ACCESS__",
    };
  }

  return {
    module: {
      in: allowedModules,
    },
  };
}

function sanitizeDocument(document) {
  if (!document) return document;

  const { filePath, storageProvider, ...safeDocument } = document;

  return safeDocument;
}

function sanitizeDocuments(documents) {
  return documents.map(sanitizeDocument);
}

async function getRawDocumentByIdForAccess(id, user) {
  const document = await prisma.document.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: documentInclude,
  });

  if (!document) {
    throw new AppError("Doküman bulunamadı.", 404);
  }

  assertDocumentAccess(user, document);

  return document;
}

export async function uploadDocumentService({ payload, file, user }) {
  if (!file) {
    throw new AppError("Dosya zorunludur.", 400);
  }

  assertEnumValue(payload.module, DOCUMENT_MODULES, "module");
  assertEnumValue(payload.entityType, DOCUMENT_ENTITY_TYPES, "entityType");
  assertEnumValue(payload.documentType, DOCUMENT_TYPES, "documentType");

  assertDocumentCreateAccess(user, payload.module);

  const moduleFolder = normalizeStoragePart(payload.module);
  const entityFolder = normalizeStoragePart(payload.entityType);
  const entityIdFolder = normalizeStoragePart(payload.entityId);

  const safeOriginalFileName = sanitizeFileName(file.originalname || "document");
  const storedFileName = createStoredFileName(file);
  const fileExtension = path.extname(safeOriginalFileName).toLowerCase();

  let uploadedStoragePath = null;

  try {
    await ensureStorageFolder(moduleFolder);
    await ensureStorageFolder(moduleFolder, entityFolder);
    await ensureStorageFolder(moduleFolder, entityFolder, entityIdFolder);

    const storagePath = buildStoragePath(moduleFolder, entityFolder, entityIdFolder, storedFileName);

    const uploadResult = await uploadFile({
      localFilePath: file.path,
      storagePath,
      overwrite: true,
    });

    uploadedStoragePath = uploadResult.storagePath;

    const createdDocument = await prisma.document.create({
      data: {
        module: payload.module,
        entityType: payload.entityType,
        entityId: payload.entityId,
        documentType: payload.documentType || "OTHER",
        title: payload.title || safeOriginalFileName,
        description: payload.description || null,
        originalFileName: safeOriginalFileName,
        storedFileName,
        filePath: uploadResult.storagePath,
        mimeType: file.mimetype || null,
        fileExtension: fileExtension || null,
        sizeBytes: file.size || null,
        storageProvider: uploadResult.provider || null,
        uploadedById: user?.id || null,
      },
    });

    return sanitizeDocument(createdDocument);
  } catch (error) {
    if (uploadedStoragePath) {
      await cleanupStorageResources([uploadedStoragePath], async (resourcePath) => {
        const { deleteFile } = await import("../storage/index.js");
        return deleteFile(resourcePath);
      });
    }

    throw error;
  } finally {
    await cleanupLocalFile(file.path);
  }
}

export async function listDocumentsService(query = {}, user) {
  assertEnumValue(query.module, DOCUMENT_MODULES, "module");
  assertEnumValue(query.entityType, DOCUMENT_ENTITY_TYPES, "entityType");
  assertEnumValue(query.documentType, DOCUMENT_TYPES, "documentType");

  const where = {
    isActive: true,
    ...buildDocumentScopeWhere(user),
  };

  if (query.module) where.module = query.module;
  if (query.entityType) where.entityType = query.entityType;
  if (query.entityId) where.entityId = query.entityId;
  if (query.documentType) where.documentType = query.documentType;

  const documents = await prisma.document.findMany({
    where,
    include: documentInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return sanitizeDocuments(documents);
}

export async function getDocumentByIdService(id, user) {
  const document = await getRawDocumentByIdForAccess(id, user);

  return sanitizeDocument(document);
}

function sanitizeDownloadUrl(url) {
  if (!url || typeof url !== "string") {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    const fileName = path.basename(url);
    return `/uploads/${fileName}`;
  }

  return url;
}

export async function getDocumentDownloadUrlService(id, user) {
  const document = await getRawDocumentByIdForAccess(id, user);
  const url = await getDownloadUrl(document.filePath);

  return {
    id: document.id,
    fileName: document.originalFileName,
    mimeType: document.mimeType,
    url: sanitizeDownloadUrl(url),
  };
}

export async function deactivateDocumentService(id, user) {
  const existing = await getRawDocumentByIdForAccess(id, user);

  assertDocumentDeleteAccess(user, existing);

  const updatedDocument = await prisma.document.update({
    where: {
      id: existing.id,
    },
    data: {
      isActive: false,
    },
  });

  return sanitizeDocument(updatedDocument);
}
