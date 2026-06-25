import fs from "fs";
import path from "path";
import axios from "axios";

import { storageClient } from "../storage.client.js";
import { storageConfig } from "../storage.config.js";
import { normalizeStorageError, StorageError } from "../storage.errors.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTemporaryYandexError = (error) => {
  const status = error.response?.status;
  const code = error.response?.data?.error;
  const message = String(error.response?.data?.message || error.response?.data?.description || error.message || "");

  return (
    status === 423 ||
    status === 429 ||
    code === "DiskResourceLockedError" ||
    code === "TooManyRequestsError" ||
    message.includes("заблокирован") ||
    message.toLowerCase().includes("locked")
  );
};

const normalizePathPart = (value) => {
  const part = String(value || "").trim();

  if (!part) return "";

  if (part.includes("\0")) {
    throw new StorageError("Geçersiz storage path.", 400);
  }

  if (part.includes(":")) {
    throw new StorageError("Storage path ':' içeremez.", 400);
  }

  const segments = part
    .replace(/^\/+|\/+$/g, "")
    .split(/[\\/]+/)
    .filter(Boolean);

  if (segments.some((segment) => segment === "." || segment === "..")) {
    throw new StorageError("Geçersiz storage path segmenti.", 400);
  }

  return segments.join("/");
};

export const buildPath = (...parts) => {
  const cleanParts = [storageConfig.appRoot, ...parts].map(normalizePathPart).filter(Boolean);

  return `disk:/${cleanParts.join("/")}`;
};

export const checkConnection = async () => {
  try {
    const response = await storageClient.get("/");
    return response.data;
  } catch (error) {
    throw normalizeStorageError(error, "Yandex Disk bağlantısı kurulamadı.");
  }
};

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

export const ensureFolder = async (...parts) => {
  const cleanParts = [storageConfig.appRoot, ...parts].map(normalizePathPart).filter(Boolean);

  let currentPath = "disk:";

  for (const part of cleanParts) {
    currentPath = `${currentPath}/${part}`;

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        await storageClient.put("/resources", null, {
          params: {
            path: currentPath,
          },
        });

        break;
      } catch (error) {
        if (error.response?.status === 409) {
          break;
        }

        if (isTemporaryYandexError(error) && attempt < 4) {
          await sleep(500 * attempt);
          continue;
        }

        throw normalizeStorageError(error, "Storage klasörü oluşturulamadı.");
      }
    }
  }

  return currentPath;
};

export const uploadFile = async ({ localFilePath, storagePath, overwrite = true }) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      throw new Error("Lokal dosya bulunamadı.");
    }

    if (overwrite) {
      await deleteFile(storagePath);
    }

    let uploadLinkResponse;

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        uploadLinkResponse = await storageClient.get("/resources/upload", {
          params: {
            path: storagePath,
            overwrite: overwrite ? "true" : "false",
          },
        });

        break;
      } catch (error) {
        if (isTemporaryYandexError(error) && attempt < 4) {
          await sleep(500 * attempt);
          continue;
        }

        throw error;
      }
    }

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        await axios.put(uploadLinkResponse.data.href, fs.createReadStream(localFilePath), {
          headers: {
            "Content-Type": "application/octet-stream",
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 120000,
        });

        break;
      } catch (error) {
        if (isTemporaryYandexError(error) && attempt < 4) {
          await sleep(500 * attempt);
          continue;
        }

        throw error;
      }
    }

    return {
      storagePath,
      fileName: path.basename(storagePath),
      provider: "YANDEX",
    };
  } catch (error) {
    console.error("YANDEX_UPLOAD_ERROR", {
      status: error.response?.status,
      providerError: error.response?.data?.error,
      message: error.message,
    });

    throw normalizeStorageError(error, "Storage dosya yükleme hatası.");
  }
};

export const deleteFile = async (storagePath) => {
  if (!storagePath) return true;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
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

      if (isTemporaryYandexError(error) && attempt < 4) {
        await sleep(500 * attempt);
        continue;
      }

      throw normalizeStorageError(error, "Storage dosya silme hatası.");
    }
  }

  return true;
};

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
