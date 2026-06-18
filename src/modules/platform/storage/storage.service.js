import { env } from "../../../config/env.js";
import { STORAGE_PROVIDERS } from "../../../constants/storageProviders.js";

import * as localStorage from "./providers/localStorage.service.js";
import * as yandexStorage from "./providers/yandexDisk.service.js";
import * as googleDriveStorage from "./providers/googleDriveStorage.service.js";
import * as oneDriveStorage from "./providers/oneDriveStorage.service.js";
import * as s3Storage from "./providers/s3Storage.service.js";
import * as minioStorage from "./providers/minioStorage.service.js";

import { StorageError } from "./storage.errors.js";

// Desteklenen storage provider'ları
const providers = {
  [STORAGE_PROVIDERS.LOCAL]: localStorage,
  [STORAGE_PROVIDERS.YANDEX]: yandexStorage,
  [STORAGE_PROVIDERS.GOOGLE_DRIVE]: googleDriveStorage,
  [STORAGE_PROVIDERS.ONEDRIVE]: oneDriveStorage,
  [STORAGE_PROVIDERS.S3]: s3Storage,
  [STORAGE_PROVIDERS.MINIO]: minioStorage,
};

// Aktif provider'ı döndürür
const getProvider = () => {
  const provider = providers[env.fileStorage.provider];

  if (!provider) {
    throw new StorageError(`Desteklenmeyen storage provider: ${env.fileStorage.provider}`, 500);
  }

  return provider;
};

// Storage bağlantısını kontrol eder
export const checkStorageConnection = async () => getProvider().checkConnection();

// Storage ana klasörünü veya alt klasörleri oluşturur
export const ensureStorageFolder = async (...parts) => getProvider().ensureFolder(...parts);

// Storage path üretir
export const buildStoragePath = (...parts) => getProvider().buildPath(...parts);

// Dosya yükler
export const uploadFile = async (options) => getProvider().uploadFile(options);

// Dosya siler
export const deleteFile = async (path) => getProvider().deleteFile(path);

// Dosya veya klasör bilgisi getirir
export const getResourceInfo = async (path) => getProvider().getResourceInfo(path);

// Kaynak mevcut mu kontrol eder
export const resourceExists = async (path) => getProvider().resourceExists(path);

// İndirme linki oluşturur
export const getDownloadUrl = async (path) => getProvider().getDownloadUrl(path);

// Dosya veya klasörü taşır
export const moveResource = async (options) => getProvider().moveResource(options);

// Dosya veya klasörü kopyalar
export const copyResource = async (options) => getProvider().copyResource(options);

// Dosyayı public paylaşır
export const publishResource = async (path) => getProvider().publishResource(path);

// Public paylaşımı kaldırır
export const unpublishResource = async (path) => getProvider().unpublishResource(path);
