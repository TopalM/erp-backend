import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach } from "vitest";

import {
  checkStorageConnection,
  ensureStorageFolder,
  buildStoragePath,
  uploadFile,
  resourceExists,
  getDownloadUrl,
  deleteFile,
} from "../../src/modules/platform/storage/storage.service.js";

const tempFile = path.join(process.cwd(), "tests", "temp-storage.txt");

describe("Local storage provider", () => {
  beforeEach(() => {
    fs.writeFileSync(tempFile, "storage test");
  });

  it("checks local storage connection", async () => {
    const result = await checkStorageConnection();

    expect(result.provider).toBe("LOCAL");
  });

  it("uploads and deletes file", async () => {
    await ensureStorageFolder("system", "test");

    const storagePath = buildStoragePath("system", "test", `file-${Date.now()}.txt`);

    const uploadResult = await uploadFile({
      localFilePath: tempFile,
      storagePath,
      overwrite: true,
    });

    expect(uploadResult.provider).toBe("LOCAL");

    const exists = await resourceExists(storagePath);
    expect(exists).toBe(true);

    const url = await getDownloadUrl(storagePath);
    expect(url).toContain("/uploads/");

    await deleteFile(storagePath);

    const existsAfterDelete = await resourceExists(storagePath);
    expect(existsAfterDelete).toBe(false);
  });
});
