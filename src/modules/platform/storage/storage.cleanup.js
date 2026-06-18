import fs from "fs/promises";

// Sunucudaki geçici dosyayı siler.
export const cleanupLocalFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Local file cleanup failed:", error.message);
  }
};

// Başarısız işlem sonrası storage rollback temizliği yapar.
export const cleanupStorageResources = async (resources, deleteFunction) => {
  if (!Array.isArray(resources) || resources.length === 0) {
    return;
  }

  for (const resource of resources) {
    try {
      await deleteFunction(resource);
    } catch (error) {
      console.error("Storage cleanup failed:", resource, error.message);
    }
  }
};
