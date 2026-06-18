import axios from "axios";

import { storageConfig } from "./storage.config.js";

// Storage API istemcisi.
//
// Yandex provider kullanıldığında aktif olur.
// Local provider kullanılıyorsa kullanılmaz.
export const storageClient = axios.create({
  baseURL: storageConfig.baseUrl,

  timeout: 30000,

  headers: {
    Authorization: `OAuth ${storageConfig.token}`,
  },
});
