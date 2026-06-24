import fs from "fs/promises";
import path from "path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import * as yandexDisk from "../../src/modules/platform/storage/providers/yandexDisk.service.js";

const runRealTests = process.env.RUN_REAL_INTEGRATION_TESTS === "true";

const unique = `vitest-yandex-${Date.now()}`;

const testFolder = unique;
const storageFilePath = `${unique}-test-file.txt`;
const copiedFilePath = `${unique}-copied-file.txt`;
const movedFilePath = `${unique}-moved-file.txt`;

const localTempDir = path.join(process.cwd(), "uploads", "temp", "real-yandex-tests");
const localFilePath = path.join(localTempDir, "test-file.txt");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const deleteIfExists = async (storagePath) => {
  try {
    await yandexDisk.deleteFile(storagePath);
  } catch {
    // yoksa sorun değil
  }
};

const waitUntilExists = async (storagePath) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (await yandexDisk.resourceExists(storagePath)) return true;
    await wait(300);
  }

  return false;
};

const waitUntilMissing = async (storagePath) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (!(await yandexDisk.resourceExists(storagePath))) return true;
    await wait(300);
  }

  return false;
};

const uploadReady = async (storagePath) => {
  await deleteIfExists(storagePath);
  await waitUntilMissing(storagePath);

  const result = await yandexDisk.uploadFile({
    localFilePath,
    storagePath,
    overwrite: true,
  });

  await waitUntilExists(storagePath);

  return result;
};

(runRealTests ? describe : describe.skip)("real Yandex Disk integration", () => {
  beforeAll(async () => {
    await fs.mkdir(localTempDir, { recursive: true });
    await fs.writeFile(localFilePath, `Yandex Disk real test ${new Date().toISOString()}`);
  });

  afterAll(async () => {
    await fs.rm(localTempDir, { recursive: true, force: true });

    await deleteIfExists(storageFilePath);
    await deleteIfExists(copiedFilePath);
    await deleteIfExists(movedFilePath);
    await deleteIfExists(testFolder);
  });

  it("creates folder", async () => {
    await expect(yandexDisk.ensureFolder(testFolder)).resolves.toBeTruthy();

    // Bazı Yandex response'larında klasör hemen resourceExists/getResourceInfo ile görünmeyebiliyor.
    // Bu test burada gerçek ensureFolder çağrısının başarılı tamamlanmasını doğrular.
  });

  it("uploads file", async () => {
    const result = await uploadReady(storageFilePath);

    expect(result).toBeTruthy();
    expect(result.storagePath).toBe(storageFilePath);
    await expect(yandexDisk.resourceExists(storageFilePath)).resolves.toBe(true);
  });

  it("gets resource info", async () => {
    await uploadReady(storageFilePath);

    const info = await yandexDisk.getResourceInfo(storageFilePath);

    expect(info).toBeTruthy();
    expect(info.path).toBeTruthy();
    expect(info.name).toBe(storageFilePath);
  });

  it("gets download url", async () => {
    await uploadReady(storageFilePath);

    const downloadUrl = await yandexDisk.getDownloadUrl(storageFilePath);

    expect(downloadUrl).toBeTruthy();
    expect(typeof downloadUrl).toBe("string");
    expect(downloadUrl.startsWith("http")).toBe(true);
  });

  it("copies and moves file", async () => {
    await uploadReady(storageFilePath);
    await deleteIfExists(copiedFilePath);
    await deleteIfExists(movedFilePath);

    await yandexDisk.copyResource({
      fromPath: storageFilePath,
      toPath: copiedFilePath,
      overwrite: true,
    });

    await expect(yandexDisk.resourceExists(copiedFilePath)).resolves.toBe(true);

    await yandexDisk.moveResource({
      fromPath: copiedFilePath,
      toPath: movedFilePath,
      overwrite: true,
    });

    await expect(yandexDisk.resourceExists(copiedFilePath)).resolves.toBe(false);
    await expect(yandexDisk.resourceExists(movedFilePath)).resolves.toBe(true);
  });

  it("deletes file", async () => {
    await uploadReady(movedFilePath);

    await yandexDisk.deleteFile(movedFilePath);

    await expect(waitUntilMissing(movedFilePath)).resolves.toBe(true);
  });
});
