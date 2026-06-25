import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const tempUploadDir = path.resolve(process.cwd(), "uploads", "temp");

if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".webp"];

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
  ".jsp",
  ".aspx",
]);

const extensionMimeMap = {
  ".pdf": ["application/pdf"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".doc": ["application/msword", "application/octet-stream"],
  ".xls": ["application/vnd.ms-excel", "application/octet-stream"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip"],
  ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip"],
};

const createUploadError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getFileNameParts = (filename = "file") => {
  const rawName = String(filename || "file");

  if (!rawName.trim() || rawName.includes("\0")) {
    throw createUploadError("Dosya adı güvenli değil.");
  }

  if (rawName.includes("/") || rawName.includes("\\")) {
    throw createUploadError("Dosya adı güvenli değil.");
  }

  const baseOnly = path.basename(rawName);

  if (baseOnly !== rawName) {
    throw createUploadError("Dosya adı güvenli değil.");
  }

  const ext = path.extname(baseOnly).toLowerCase();

  if (!ext) {
    throw createUploadError("Desteklenmeyen dosya uzantısı.");
  }

  if (!allowedExtensions.includes(ext)) {
    throw createUploadError("Desteklenmeyen dosya uzantısı.");
  }

  const lowerName = baseOnly.toLowerCase();
  const parts = lowerName.split(".").filter(Boolean);

  if (parts.length > 2) {
    const middleExtensions = parts.slice(1, -1).map((part) => `.${part}`);

    if (middleExtensions.some((middleExt) => dangerousExtensions.has(middleExt))) {
      throw createUploadError("Dosya adı güvenli değil.");
    }
  }

  const baseName = path.basename(baseOnly, ext);

  return {
    ext,
    baseName,
  };
};

const sanitizeFileName = (filename = "file") => {
  const { ext, baseName } = getFileNameParts(filename);

  const safeBaseName = baseName
    .replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ._ -]/g, "-")
    .replace(/\.+/g, ".")
    .replace(/-+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[-. ]+|[-. ]+$/g, "")
    .slice(0, 60);

  return `${safeBaseName || "file"}${ext}`;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (_req, file, cb) => {
    try {
      const safeOriginalName = sanitizeFileName(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginalName}`);
    } catch (error) {
      cb(error);
    }
  },
});

const fileFilter = (_req, file, cb) => {
  try {
    const { ext } = getFileNameParts(file.originalname);

    const allowedMimes = extensionMimeMap[ext];

    if (allowedMimes?.length && file.mimetype && !allowedMimes.includes(file.mimetype)) {
      return cb(createUploadError("Dosya MIME tipi uzantı ile uyumlu değil."));
    }

    return cb(null, true);
  } catch (error) {
    return cb(error);
  }
};

export const uploadTempFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
});
