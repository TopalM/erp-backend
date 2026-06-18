import { env } from "../../../config/env.js";

// OAuth token bilgisini normalize eder.
const normalizeOAuthToken = (token) => {
  return String(token || "")
    .replace(/^OAuth\s+/i, "")
    .trim();
};

// Merkezi storage konfigürasyonu.
export const storageConfig = {
  provider: env.fileStorage.provider,

  // Yandex Disk REST API adresi
  baseUrl: "https://cloud-api.yandex.net/v1/disk",

  // Şimdilik Yandex tokenı buradan okunur.
  // İleride provider bazlı tokenlar fileStorage içine de alınabilir.
  token: normalizeOAuthToken(env.yandexDisk.token),

  // Storage ana klasörü
  appRoot: env.fileStorage.basePath || env.yandexDisk.basePath,

  // Local provider için lokal dosya kök dizini
  localRoot: env.fileStorage.localRoot,
};
