import { env } from "../../../config/env.js";
import { storageConfig } from "./storage.config.js";
import { checkStorageConnection, ensureStorageFolder } from "./storage.service.js";

// Uygulama açılışında çalışır.
//
// Amaç:
// - Storage provider bağlantısını test etmek
// - Gerekli klasör yapısını oluşturmak
// - Sistem hazır değilse uygulamayı başlatmamak
export const bootstrapStorage = async () => {
  console.log("Storage provider check:", {
    provider: env.fileStorage.provider,
    basePath: storageConfig.appRoot,
  });

  console.log("Checking storage connection...");

  await checkStorageConnection();

  console.log("Storage connection successful.");

  await ensureStorageFolder();

  const folders = [
    "users",
    "users/profile-photos",

    "suppliers",
    "suppliers/documents",
    "suppliers/certificates",

    "raw-materials",
    "raw-materials/coa",
    "raw-materials/sds",
    "raw-materials/tds",

    "products",
    "products/documents",

    "quality",
    "quality/reports",
    "quality/certificates",

    "production",
    "production/orders",
    "production/reports",

    "maintenance",
    "maintenance/documents",

    "shipments",
    "shipments/documents",

    "system",
    "system/temp",
    "system/archive",
  ];

  for (const folder of folders) {
    await ensureStorageFolder(folder);
  }

  console.log(`Storage folder structure ready: ${storageConfig.appRoot}`);
};
