import { StorageError } from "../storage.errors.js";

// Google Drive provider henüz geliştirilmedi.
const notImplemented = () => {
  throw new StorageError("Google Drive storage provider henüz implement edilmedi.", 501);
};

export const checkConnection = notImplemented;
export const ensureFolder = notImplemented;
export const buildPath = notImplemented;

export const uploadFile = notImplemented;
export const deleteFile = notImplemented;

export const getResourceInfo = notImplemented;
export const resourceExists = notImplemented;
export const getDownloadUrl = notImplemented;

export const moveResource = notImplemented;
export const copyResource = notImplemented;

export const publishResource = notImplemented;
export const unpublishResource = notImplemented;
