import fs from "fs";
import path from "path";
import axios from "axios";

import { storageClient } from "../storage.client.js";
import { storageConfig } from "../storage.config.js";
import { normalizeStorageError } from "../storage.errors.js";

// Path parçalarını temizler.
const normalizePathPart = (value) => {
  return String(value || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
};

// Yandex Disk path üretir.
// Örnek: disk:/PlastifayERP/suppliers/documents/file.pdf
export const buildPath = (...parts) => {
  const cleanParts = [storageConfig.appRoot, ...parts].map(normalizePathPart).filter(Boolean);

  return `disk:/${cleanParts.join("/")}`;
};

// Yandex Disk bağlantısını kontrol eder.
export const checkConnection = async () => {
  try {
    const response = await storageClient.get("/");
    return response.data;
  } catch (error) {
    throw normalizeStorageError(error, "Yandex Disk bağlantısı kurulamadı.");
  }
};

// Kaynak bilgisi getirir.
export const getResourceInfo = async (diskPath) => {
  try {
    const response = await storageClient.get("/resources", {
      params: {
        path: diskPath,
      },
    });

    return response.data;
  } catch (error) {
    throw normalizeStorageError(error, "Storage kaynak bilgisi alınamadı.");
  }
};

// Kaynak var mı kontrol eder.
export const resourceExists = async (diskPath) => {
  try {
    await getResourceInfo(diskPath);
    return true;
  } catch (error) {
    if (error.statusCode === 404) {
      return false;
    }

    throw error;
  }
};

// Klasör oluşturur.
export const ensureFolder = async (...parts) => {
  const cleanParts = [storageConfig.appRoot, ...parts].map(normalizePathPart).filter(Boolean);

  let currentPath = "disk:";

  for (const part of cleanParts) {
    currentPath = `${currentPath}/${part}`;

    try {
      await storageClient.put("/resources", null, {
        params: {
          path: currentPath,
        },
      });
    } catch (error) {
      if (error.response?.status !== 409) {
        throw normalizeStorageError(error, "Storage klasörü oluşturulamadı.");
      }
    }
  }

  return currentPath;
};

// Lokal dosyayı Yandex Disk'e yükler.
export const uploadFile = async ({ localFilePath, storagePath, overwrite = true }) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      throw new Error("Lokal dosya bulunamadı.");
    }

    if (overwrite) {
      await deleteFile(storagePath);
    }

    const uploadLinkResponse = await storageClient.get("/resources/upload", {
      params: {
        path: storagePath,
        overwrite: overwrite ? "true" : "false",
      },
    });

    await axios.put(uploadLinkResponse.data.href, fs.createReadStream(localFilePath), {
      headers: {
        "Content-Type": "application/octet-stream",
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000,
    });

    return {
      storagePath,
      fileName: path.basename(storagePath),
      provider: "YANDEX",
    };
  } catch (error) {
    console.log("YANDEX_UPLOAD_ERROR", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      storagePath,
    });

    throw normalizeStorageError(error, "Storage dosya yükleme hatası.");
  }
};

// Dosya veya klasör siler.
export const deleteFile = async (storagePath) => {
  if (!storagePath) return true;

  try {
    await storageClient.delete("/resources", {
      params: {
        path: storagePath,
        permanently: true,
      },
    });

    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      return true;
    }

    throw normalizeStorageError(error, "Storage dosya silme hatası.");
  }
};

// Geçici indirme linki üretir.
export const getDownloadUrl = async (storagePath) => {
  try {
    const response = await storageClient.get("/resources/download", {
      params: {
        path: storagePath,
      },
    });

    return response.data.href;
  } catch (error) {
    throw normalizeStorageError(error, "Storage indirme linki alınamadı.");
  }
};

// Dosya veya klasör taşır.
export const moveResource = async ({ fromPath, toPath, overwrite = true }) => {
  try {
    await storageClient.post("/resources/move", null, {
      params: {
        from: fromPath,
        path: toPath,
        overwrite,
      },
    });

    return {
      fromPath,
      toPath,
    };
  } catch (error) {
    throw normalizeStorageError(error, "Storage taşıma işlemi başarısız.");
  }
};

// Dosya veya klasör kopyalar.
export const copyResource = async ({ fromPath, toPath, overwrite = true }) => {
  try {
    await storageClient.post("/resources/copy", null, {
      params: {
        from: fromPath,
        path: toPath,
        overwrite,
      },
    });

    return {
      fromPath,
      toPath,
    };
  } catch (error) {
    throw normalizeStorageError(error, "Storage kopyalama işlemi başarısız.");
  }
};

// Dosyayı public hale getirir.
export const publishResource = async (storagePath) => {
  try {
    await storageClient.put("/resources/publish", null, {
      params: {
        path: storagePath,
      },
    });

    return true;
  } catch (error) {
    throw normalizeStorageError(error, "Storage yayınlama işlemi başarısız.");
  }
};

// Public paylaşımı kaldırır.
export const unpublishResource = async (storagePath) => {
  try {
    await storageClient.put("/resources/unpublish", null, {
      params: {
        path: storagePath,
      },
    });

    return true;
  } catch (error) {
    throw normalizeStorageError(error, "Storage yayından kaldırma işlemi başarısız.");
  }
};
