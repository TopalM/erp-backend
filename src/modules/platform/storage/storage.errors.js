import { AppError } from "../../../utils/appError.js";

// Storage işlemleri sırasında oluşan hatalar için kullanılan özel hata sınıfı.
export class StorageError extends AppError {
  constructor(message = "Storage işlemi sırasında hata oluştu.", statusCode = 500, errors = null) {
    super(message, statusCode, errors);

    this.name = "StorageError";
  }
}

// Storage provider'lardan (Yandex, Local, S3 vb.)
// dönen hataları sistemde kullanılan standart hata formatına dönüştürür.
export const normalizeStorageError = (error, fallbackMessage = "Storage işlemi sırasında hata oluştu.") => {
  const status = error.response?.status;

  const providerMessage = error.response?.data?.message || error.response?.data?.description;

  // Yetkilendirme hatası
  if (status === 401 || status === 403) {
    return new StorageError("Storage yetkilendirme hatası.", 500);
  }

  // Kaynak bulunamadı
  if (status === 404) {
    return new StorageError("Storage kaynağı bulunamadı.", 404);
  }

  // Dosya veya klasör zaten mevcut
  if (status === 409) {
    return new StorageError("Storage kaynağı zaten mevcut.", 409);
  }

  // Depolama alanı yetersiz
  if (status === 507) {
    return new StorageError("Storage üzerinde yeterli alan bulunmuyor.", 500);
  }

  // Beklenmeyen hatalar
  return new StorageError(providerMessage || error.message || fallbackMessage, 500);
};
