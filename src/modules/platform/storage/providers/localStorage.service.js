import fs from "fs";
import fsp from "fs/promises";
import path from "path";

import { storageConfig } from "../storage.config.js";
import { StorageError } from "../storage.errors.js";

const localRoot = storageConfig.localRoot;
const storageRoot = path.resolve(localRoot);

const assertInsideStorageRoot = (targetPath) => {
  const resolvedPath = path.resolve(targetPath);

  if (resolvedPath !== storageRoot && !resolvedPath.startsWith(`${storageRoot}${path.sep}`)) {
    throw new StorageError("Storage root dışına erişim engellendi.", 400);
  }

  return resolvedPath;
};

const normalizePathPart = (value) => {
  const part = String(value || "").trim();

  if (!part) return "";

  if (part.includes("\0")) {
    throw new StorageError("Geçersiz storage path.", 400);
  }

  if (path.isAbsolute(part)) {
    const segmentsFromAbsolute = part.split(/[\\/]+/).filter(Boolean);

    if (segmentsFromAbsolute.some((segment) => segment === "." || segment === "..")) {
      throw new StorageError("Geçersiz storage path segmenti.", 400);
    }

    return segmentsFromAbsolute.join(path.sep);
  }

  const segments = part.split(/[\\/]+/).filter(Boolean);

  if (segments.some((segment) => segment === "." || segment === "..")) {
    throw new StorageError("Path traversal tespit edildi.", 400);
  }

  return segments.join(path.sep);
};

const resolveStoragePath = (storagePath) => {
  const value = String(storagePath || "").trim();

  if (!value) {
    throw new StorageError("Storage path zorunludur.", 400);
  }

  if (path.isAbsolute(value)) {
    const resolvedPath = path.resolve(value);

    if (resolvedPath === storageRoot || resolvedPath.startsWith(`${storageRoot}${path.sep}`)) {
      return resolvedPath;
    }

    throw new StorageError("Storage root dışına erişim engellendi.", 400);
  }

  const cleanPath = normalizePathPart(value);

  return assertInsideStorageRoot(path.join(storageRoot, cleanPath));
};

export const buildPath = (...parts) => {
  const cleanParts = [storageConfig.appRoot, ...parts].map(normalizePathPart).filter(Boolean);

  return assertInsideStorageRoot(path.join(storageRoot, ...cleanParts));
};

export const checkConnection = async () => {
  await fsp.mkdir(localRoot, { recursive: true });

  return {
    provider: "LOCAL",
    root: localRoot,
  };
};

export const ensureFolder = async (...parts) => {
  const folderPath = buildPath(...parts);

  await fsp.mkdir(folderPath, { recursive: true });

  return folderPath;
};

export const getResourceInfo = async (storagePath) => {
  try {
    const safePath = resolveStoragePath(storagePath);
    const stat = await fsp.lstat(safePath);

    if (stat.isSymbolicLink()) {
      throw new StorageError("Symlink kaynaklarına erişim engellendi.", 400);
    }

    return {
      path: safePath,
      name: path.basename(safePath),
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
      size: stat.size,
      createdAt: stat.birthtime,
      updatedAt: stat.mtime,
    };
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError("Storage kaynağı bulunamadı.", 404);
  }
};

export const resourceExists = async (storagePath) => {
  try {
    const safePath = resolveStoragePath(storagePath);
    await fsp.access(safePath);
    return true;
  } catch {
    return false;
  }
};

export const uploadFile = async ({ localFilePath, storagePath, overwrite = true }) => {
  if (!localFilePath || !fs.existsSync(localFilePath)) {
    throw new StorageError("Lokal dosya bulunamadı.", 400);
  }

  const safeStoragePath = resolveStoragePath(storagePath);
  const exists = await resourceExists(safeStoragePath);

  if (exists && !overwrite) {
    throw new StorageError("Storage kaynağı zaten mevcut.", 409);
  }

  await fsp.mkdir(path.dirname(safeStoragePath), { recursive: true });
  await fsp.copyFile(localFilePath, safeStoragePath);

  return {
    storagePath,
    fileName: path.basename(safeStoragePath),
    provider: "LOCAL",
  };
};

export const deleteFile = async (storagePath) => {
  if (!storagePath) return true;

  const value = String(storagePath).trim();

  if (value === "/" || value === "\\" || value === storageConfig.appRoot) {
    throw new StorageError("Storage root silinemez.", 400);
  }

  try {
    const safePath = resolveStoragePath(storagePath);

    if (safePath === storageRoot || safePath === buildPath()) {
      throw new StorageError("Storage root silinemez.", 400);
    }

    await fsp.rm(safePath, {
      recursive: true,
      force: true,
    });

    return true;
  } catch (error) {
    if (error instanceof StorageError) {
      if (error.message === "Storage root silinemez.") {
        throw error;
      }

      return true;
    }

    return true;
  }
};

export const getDownloadUrl = async (storagePath) => {
  const safePath = resolveStoragePath(storagePath);

  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  const relativeToUploads = path.relative(uploadsRoot, safePath);

  if (!relativeToUploads.startsWith("..") && !path.isAbsolute(relativeToUploads)) {
    return `/uploads/${relativeToUploads.replace(/\\/g, "/")}`;
  }

  const relativeToStorageRoot = path.relative(storageRoot, safePath);

  if (relativeToStorageRoot.startsWith("..") || path.isAbsolute(relativeToStorageRoot)) {
    throw new StorageError("İndirme path'i geçersiz.", 400);
  }

  return `/uploads/storage/${relativeToStorageRoot.replace(/\\/g, "/")}`;
};

export const moveResource = async ({ fromPath, toPath, overwrite = true }) => {
  const safeFromPath = resolveStoragePath(fromPath);
  const safeToPath = resolveStoragePath(toPath);

  const exists = await resourceExists(safeToPath);

  if (exists && !overwrite) {
    throw new StorageError("Hedef storage kaynağı zaten mevcut.", 409);
  }

  await fsp.mkdir(path.dirname(safeToPath), { recursive: true });
  await fsp.rename(safeFromPath, safeToPath);

  return {
    fromPath,
    toPath,
  };
};

export const copyResource = async ({ fromPath, toPath, overwrite = true }) => {
  const safeFromPath = resolveStoragePath(fromPath);
  const safeToPath = resolveStoragePath(toPath);

  const exists = await resourceExists(safeToPath);

  if (exists && !overwrite) {
    throw new StorageError("Hedef storage kaynağı zaten mevcut.", 409);
  }

  await fsp.mkdir(path.dirname(safeToPath), { recursive: true });
  await fsp.cp(safeFromPath, safeToPath, {
    recursive: true,
    force: overwrite,
  });

  return {
    fromPath,
    toPath,
  };
};

export const publishResource = async () => true;

export const unpublishResource = async () => true;
