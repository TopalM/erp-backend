import path from "path";

import { env } from "../../../config/env.js";
import { IMPLEMENTED_STORAGE_PROVIDERS } from "../../../constants/storageProviders.js";

const normalizeOAuthToken = (token) => {
  return String(token || "")
    .replace(/^OAuth\s+/i, "")
    .trim();
};

const normalizeAppRoot = (value) => {
  const rawValue = String(value || "/PlastifayERP").trim();

  if (!rawValue) {
    return "/PlastifayERP";
  }

  if (rawValue.includes("\0")) {
    throw new Error("FILE_STORAGE_BASE_PATH geçersiz.");
  }

  const segments = rawValue
    .replace(/^\/+|\/+$/g, "")
    .split(/[\\/]+/)
    .filter(Boolean);

  if (segments.length === 0) {
    return "/PlastifayERP";
  }

  const hasInvalidSegment = segments.some((segment) => {
    return segment === "." || segment === ".." || !/^[a-zA-Z0-9._-]+$/.test(segment);
  });

  if (hasInvalidSegment) {
    throw new Error("FILE_STORAGE_BASE_PATH geçersiz path segmenti içeriyor.");
  }

  return `/${segments.join("/")}`;
};

const normalizeLocalRoot = (value) => {
  const localRoot = String(value || path.join(process.cwd(), "uploads", "storage")).trim();

  if (!localRoot) {
    throw new Error("FILE_STORAGE_LOCAL_ROOT geçersiz.");
  }

  return localRoot;
};

const provider = env.fileStorage.provider;

if (!IMPLEMENTED_STORAGE_PROVIDERS.includes(provider)) {
  throw new Error(`Storage provider implement edilmedi: ${provider}`);
}

const token = normalizeOAuthToken(env.yandexDisk.token);

if (provider === "YANDEX" && !token) {
  throw new Error("YANDEX_DISK_TOKEN zorunludur.");
}

export const storageConfig = {
  provider,
  baseUrl: "https://cloud-api.yandex.net/v1/disk",
  token,
  appRoot: normalizeAppRoot(env.fileStorage.basePath || env.yandexDisk.basePath),
  localRoot: normalizeLocalRoot(env.fileStorage.localRoot),
};
