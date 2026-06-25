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

const throwInvalidContent = async (filePath) => {
  await cleanupLocalFile(filePath);
  throw new AppError("Dosya içeriği uzantı ile uyumlu değil.", 400);
};

export const validateUploadedFileContent = async (req, _res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return next();
    }

    const ext = path.extname(file.originalname || "").toLowerCase();

    if (!extensionsThatRequireMagicBytes.has(ext)) {
      return next();
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
      return;
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
