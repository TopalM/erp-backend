import { env } from "../../../config/env.js";

const normalizeOAuthToken = (token) => {
  return String(token || "")
    .replace(/^OAuth\s+/i, "")
    .trim();
};

export const storageConfig = {
  provider: env.fileStorage.provider,
  baseUrl: "https://cloud-api.yandex.net/v1/disk",
  token: normalizeOAuthToken(env.yandexDisk.token),
  appRoot: env.fileStorage.basePath || env.yandexDisk.basePath,
  localRoot: env.fileStorage.localRoot,
};
