import fs from "node:fs/promises";
import path from "node:path";

import { fileTypeFromFile } from "file-type";

import { AppError } from "../utils/appError.js";
import { cleanupLocalFile } from "../modules/platform/storage/storage.cleanup.js";

const extensionMagicMimeMap = {
  ".pdf": ["application/pdf"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
};

const extensionsThatRequireMagicBytes = new Set(Object.keys(extensionMagicMimeMap));

const dangerousExtensions = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".ps1",
  ".php",
  ".py",
  ".rb",
  ".jar",
  ".dll",
  ".msi",
  ".com",
  ".scr",
]);

const throwInvalidContent = async (filePath) => {
  await cleanupLocalFile(filePath);
  throw new AppError("Dosya içeriği uzantı ile uyumlu değil.", 400);
};

const throwInvalidFileName = async (filePath) => {
  await cleanupLocalFile(filePath);
  throw new AppError("Dosya adı güvenli değil.", 400);
};

const getUploadedFiles = (req) => {
  if (req.file) {
    return [req.file];
  }

  if (Array.isArray(req.files)) {
    return req.files;
  }

  if (req.files && typeof req.files === "object") {
    return Object.values(req.files).flat();
  }

  return [];
};

const validateOriginalFileName = async (file) => {
  const originalName = String(file.originalname || "");

  if (!originalName.trim()) {
    await throwInvalidFileName(file.path);
  }

  if (originalName.includes("\0")) {
    await throwInvalidFileName(file.path);
  }

  if (originalName.includes("/") || originalName.includes("\\")) {
    await throwInvalidFileName(file.path);
  }

  const baseName = path.basename(originalName);

  if (baseName !== originalName) {
    await throwInvalidFileName(file.path);
  }

  const lowerName = originalName.toLowerCase();
  const parts = lowerName.split(".").filter(Boolean);

  if (parts.length > 2) {
    const middleExtensions = parts.slice(1, -1).map((part) => `.${part}`);

    if (middleExtensions.some((ext) => dangerousExtensions.has(ext))) {
      await throwInvalidFileName(file.path);
    }
  }

  const ext = path.extname(originalName).toLowerCase();

  if (dangerousExtensions.has(ext)) {
    await throwInvalidFileName(file.path);
  }
};

const validateFileMagicBytes = async (file) => {
  const ext = path.extname(file.originalname || "").toLowerCase();

  if (!extensionsThatRequireMagicBytes.has(ext)) {
    return;
  }

  const stat = await fs.stat(file.path);

  if (stat.size === 0) {
    await throwInvalidContent(file.path);
    return;
  }

  const detectedType = await fileTypeFromFile(file.path);

  if (!detectedType) {
    await throwInvalidContent(file.path);
    return;
  }

  const allowedMimes = extensionMagicMimeMap[ext];

  if (!allowedMimes.includes(detectedType.mime)) {
    await throwInvalidContent(file.path);
  }
};

export const validateUploadedFileContent = async (req, _res, next) => {
  try {
    const files = getUploadedFiles(req);

    if (files.length === 0) {
      return next();
    }

    for (const file of files) {
      await validateOriginalFileName(file);
      await validateFileMagicBytes(file);
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
