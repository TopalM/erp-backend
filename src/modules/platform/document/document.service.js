import path from "path";

import { prisma } from "../../../database/prisma.client.js";

import { buildStoragePath, ensureStorageFolder, uploadFile, getDownloadUrl } from "../storage/index.js";

import { cleanupLocalFile } from "../storage/storage.cleanup.js";

function normalizeStoragePart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ.-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function createStoredFileName(file) {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const baseName = path
    .basename(file.originalname || "document", extension)
    .replace(/[^\wğüşöçıİĞÜŞÖÇ.-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension}`;
}

export async function uploadDocumentService({ payload, file, userId }) {
  if (!file) {
    const error = new Error("Dosya zorunludur.");
    error.statusCode = 400;
    throw error;
  }

  const moduleFolder = normalizeStoragePart(payload.module);
  const entityFolder = normalizeStoragePart(payload.entityType);
  const entityIdFolder = normalizeStoragePart(payload.entityId);

  const storedFileName = createStoredFileName(file);
  const fileExtension = path.extname(file.originalname || "").toLowerCase();

  let storagePath = null;

  try {
    await ensureStorageFolder(moduleFolder);
    await ensureStorageFolder(moduleFolder, entityFolder);
    await ensureStorageFolder(moduleFolder, entityFolder, entityIdFolder);

    storagePath = buildStoragePath(moduleFolder, entityFolder, entityIdFolder, storedFileName);

    const uploadResult = await uploadFile({
      localFilePath: file.path,
      storagePath,
      overwrite: true,
    });

    const document = await prisma.document.create({
      data: {
        module: payload.module,
        entityType: payload.entityType,
        entityId: payload.entityId,

        documentType: payload.documentType || "OTHER",

        title: payload.title || file.originalname,
        description: payload.description || null,

        originalFileName: file.originalname,
        storedFileName,
        filePath: uploadResult.storagePath,

        mimeType: file.mimetype || null,
        fileExtension: fileExtension || null,
        sizeBytes: file.size || null,

        storageProvider: uploadResult.provider || null,

        uploadedById: userId || null,
      },
    });

    await cleanupLocalFile(file.path);

    return document;
  } catch (error) {
    await cleanupLocalFile(file.path);
    throw error;
  }
}

export async function listDocumentsService(query = {}) {
  const where = {
    isActive: true,
  };

  if (query.module) where.module = query.module;
  if (query.entityType) where.entityType = query.entityType;
  if (query.entityId) where.entityId = query.entityId;
  if (query.documentType) where.documentType = query.documentType;

  return prisma.document.findMany({
    where,
    include: {
      uploadedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDocumentByIdService(id) {
  const document = await prisma.document.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!document) {
    const error = new Error("Doküman bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  return document;
}

export async function getDocumentDownloadUrlService(id) {
  const document = await getDocumentByIdService(id);

  const url = await getDownloadUrl(document.filePath);

  return {
    id: document.id,
    fileName: document.originalFileName,
    mimeType: document.mimeType,
    url,
  };
}

export async function deactivateDocumentService(id) {
  const existing = await getDocumentByIdService(id);

  return prisma.document.update({
    where: {
      id: existing.id,
    },
    data: {
      isActive: false,
    },
  });
}
