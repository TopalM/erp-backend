import fs from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = path.join(process.cwd(), "uploads");
const tempUploadDir = path.join(uploadRoot, "temp");

// Kalıcı storage provider'a aktarılmadan önce
// dosyaların geçici olarak tutulacağı klasör.
// Bu klasör kalıcı dosya saklama yeri değildir.
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

// Sistemde geçici olarak kabul edilen dosya uzantıları.
// İlgili service dosyayı daha sonra aktif storage provider'a taşır.
const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".webp"];

// Dosyayı geçici klasöre kaydeder.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },

  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/[^\w.\-ğüşöçıİĞÜŞÖÇ ]/gi, "");

    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginalName}`;

    cb(null, uniqueName);
  },
});

// Dosya uzantısı kontrolü yapar.
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(new Error("Desteklenmeyen dosya formatı."));
  }

  cb(null, true);
};

// Genel geçici dosya yükleme middleware'i.
// Dosyalar burada kalıcı tutulmaz.
// İlgili service dosyayı aktif storage provider'a taşıdıktan sonra
// temp dosya cleanupLocalFile ile silinmelidir.
export const uploadTempFiles = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 10,
  },
});
