import fs from "fs";
import fsp from "fs/promises";
import path from "path";

import { storageConfig } from "../storage.config.js";
import { StorageError } from "../storage.errors.js";

const localRoot = path.join(process.cwd(), "uploads", "storage");

// Path parçalarını temizler.
const normalizePathPart = (value) => {
  return String(value || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
};

// Local storage path üretir.
// Örnek: uploads/storage/PlastifayERP/suppliers/documents/file.pdf
export const buildPath = (...parts) => {
  const cleanParts = [storageConfig.appRoot, ...parts].map(normalizePathPart).filter(Boolean);

  return path.join(localRoot, ...cleanParts);
};

// Local storage bağlantısını kontrol eder.
// Local provider için klasöre erişilebilir mi kontrolü yeterlidir.
export const checkConnection = async () => {
  await fsp.mkdir(localRoot, { recursive: true });

  return {
    provider: "LOCAL",
    root: localRoot,
  };
};

// Klasör oluşturur.
export const ensureFolder = async (...parts) => {
  const folderPath = buildPath(...parts);

  await fsp.mkdir(folderPath, { recursive: true });

  return folderPath;
};

// Kaynak bilgisi getirir.
export const getResourceInfo = async (storagePath) => {
  try {
    const stat = await fsp.stat(storagePath);

    return {
      path: storagePath,
      name: path.basename(storagePath),
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
      size: stat.size,
      createdAt: stat.birthtime,
      updatedAt: stat.mtime,
    };
  } catch (error) {
    throw new StorageError("Storage kaynağı bulunamadı.", 404);
  }
};

// Kaynak var mı kontrol eder.
export const resourceExists = async (storagePath) => {
  try {
    await fsp.access(storagePath);
    return true;
  } catch {
    return false;
  }
};

// Lokal temp dosyayı local storage hedefine kopyalar.
export const uploadFile = async ({ localFilePath, storagePath, overwrite = true }) => {
  if (!localFilePath || !fs.existsSync(localFilePath)) {
    throw new StorageError("Lokal dosya bulunamadı.", 400);
  }

  const exists = await resourceExists(storagePath);

  if (exists && !overwrite) {
    throw new StorageError("Storage kaynağı zaten mevcut.", 409);
  }

  await fsp.mkdir(path.dirname(storagePath), { recursive: true });
  await fsp.copyFile(localFilePath, storagePath);

  return {
    storagePath,
    fileName: path.basename(storagePath),
    provider: "LOCAL",
  };
};

// Dosya veya klasör siler.
export const deleteFile = async (storagePath) => {
  if (!storagePath) return true;

  try {
    await fsp.rm(storagePath, {
      recursive: true,
      force: true,
    });

    return true;
  } catch {
    return true;
  }
};

// Local dosya için indirilebilir URL üretir.
// Bunun çalışması için app.js içinde uploads klasörü static servis edilmelidir.
export const getDownloadUrl = async (storagePath) => {
  const relativePath = path.relative(path.join(process.cwd(), "uploads"), storagePath);

  return `/uploads/${relativePath.replace(/\\/g, "/")}`;
};

// Dosya veya klasör taşır.
export const moveResource = async ({ fromPath, toPath, overwrite = true }) => {
  const exists = await resourceExists(toPath);

  if (exists && !overwrite) {
    throw new StorageError("Hedef storage kaynağı zaten mevcut.", 409);
  }

  await fsp.mkdir(path.dirname(toPath), { recursive: true });
  await fsp.rename(fromPath, toPath);

  return {
    fromPath,
    toPath,
  };
};

// Dosya veya klasör kopyalar.
export const copyResource = async ({ fromPath, toPath, overwrite = true }) => {
  const exists = await resourceExists(toPath);

  if (exists && !overwrite) {
    throw new StorageError("Hedef storage kaynağı zaten mevcut.", 409);
  }

  await fsp.mkdir(path.dirname(toPath), { recursive: true });
  await fsp.cp(fromPath, toPath, {
    recursive: true,
    force: overwrite,
  });

  return {
    fromPath,
    toPath,
  };
};

// Local provider için public/private ayrımı yok.
// Static servis ediliyorsa zaten erişilebilir.
export const publishResource = async () => {
  return true;
};

// Local provider için public/private ayrımı yok.
export const unpublishResource = async () => {
  return true;
};
