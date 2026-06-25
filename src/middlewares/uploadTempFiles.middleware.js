import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const tempUploadDir = "uploads/temp";

if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".webp"];

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

const sanitizeFileName = (filename = "file") => {
  const ext = path.extname(filename).toLowerCase();
  const safeExt = allowedExtensions.includes(ext) ? ext : "";

  const baseName = path
    .basename(filename || "file", ext)
    .replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ._ -]/g, "-")
    .replace(/\.+/g, ".")
    .replace(/-+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[-. ]+|[-. ]+$/g, "")
    .slice(0, 60);

  return `${baseName || "file"}${safeExt}`;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (_req, file, cb) => {
    const safeOriginalName = sanitizeFileName(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginalName}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    const error = new Error("Desteklenmeyen dosya uzantısı.");
    error.statusCode = 400;
    return cb(error);
  }

  const allowedMimes = extensionMimeMap[ext];

  if (allowedMimes?.length && file.mimetype && !allowedMimes.includes(file.mimetype)) {
    const error = new Error("Dosya MIME tipi uzantı ile uyumlu değil.");
    error.statusCode = 400;
    return cb(error);
  }

  return cb(null, true);
};

export const uploadTempFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
});
