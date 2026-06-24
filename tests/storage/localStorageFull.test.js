import fs from "fs/promises";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import * as localStorage from "../../src/modules/platform/storage/providers/localStorage.service.js";

const tempRoot = path.join(process.cwd(), "uploads", "test-local-storage-full");

const createTempFile = async (name, content = "test") => {
  await fs.mkdir(tempRoot, { recursive: true });

  const filePath = path.join(tempRoot, name);
  await fs.writeFile(filePath, content);

  return filePath;
};

beforeEach(async () => {
  await fs.rm(tempRoot, { recursive: true, force: true });
  await fs.mkdir(tempRoot, { recursive: true });
  await localStorage.deleteFile("test-folder").catch(() => null);
});

afterEach(async () => {
  await fs.rm(tempRoot, { recursive: true, force: true });
  await localStorage.deleteFile("test-folder").catch(() => null);
});

describe("local storage full", () => {
  it("ensures folder", async () => {
    await expect(localStorage.ensureFolder("test-folder")).resolves.toBeTruthy();

    const localFilePath = await createTempFile("folder-check.txt", "hello");

    await localStorage.uploadFile({
      localFilePath,
      storagePath: "test-folder/folder-check.txt",
      overwrite: true,
    });

    await expect(localStorage.resourceExists("test-folder/folder-check.txt")).resolves.toBe(true);
  });

  it("uploads file", async () => {
    const localFilePath = await createTempFile("upload.txt", "hello");

    const result = await localStorage.uploadFile({
      localFilePath,
      storagePath: "test-folder/upload.txt",
      overwrite: true,
    });

    expect(result.storagePath).toBe("test-folder/upload.txt");
    expect(await localStorage.resourceExists("test-folder/upload.txt")).toBe(true);
  });

  it("rejects overwrite false when file exists", async () => {
    const localFilePath = await createTempFile("overwrite.txt", "hello");

    await localStorage.uploadFile({
      localFilePath,
      storagePath: "test-folder/overwrite.txt",
      overwrite: true,
    });

    await expect(
      localStorage.uploadFile({
        localFilePath,
        storagePath: "test-folder/overwrite.txt",
        overwrite: false,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("gets download url", async () => {
    const url = await localStorage.getDownloadUrl("test-folder/file.pdf");

    expect(url).toContain("/uploads/");
    expect(url).toContain("test-folder/file.pdf");
  });

  it("checks resource exists", async () => {
    const localFilePath = await createTempFile("exists.txt", "hello");

    await localStorage.uploadFile({
      localFilePath,
      storagePath: "test-folder/exists.txt",
      overwrite: true,
    });

    expect(await localStorage.resourceExists("test-folder/exists.txt")).toBe(true);
    expect(await localStorage.resourceExists("test-folder/missing.txt")).toBe(false);
  });

  it("copies and moves resource", async () => {
    const localFilePath = await createTempFile("copy-source.txt", "hello");

    await localStorage.uploadFile({
      localFilePath,
      storagePath: "test-folder/source.txt",
      overwrite: true,
    });

    await localStorage.copyResource({
      fromPath: "test-folder/source.txt",
      toPath: "test-folder/copied.txt",
      overwrite: true,
    });

    expect(await localStorage.resourceExists("test-folder/copied.txt")).toBe(true);

    await localStorage.moveResource({
      fromPath: "test-folder/copied.txt",
      toPath: "test-folder/moved.txt",
      overwrite: true,
    });

    expect(await localStorage.resourceExists("test-folder/copied.txt")).toBe(false);
    expect(await localStorage.resourceExists("test-folder/moved.txt")).toBe(true);
  });

  it("deletes file", async () => {
    const localFilePath = await createTempFile("delete.txt", "hello");

    await localStorage.uploadFile({
      localFilePath,
      storagePath: "test-folder/delete.txt",
      overwrite: true,
    });

    await localStorage.deleteFile("test-folder/delete.txt");

    expect(await localStorage.resourceExists("test-folder/delete.txt")).toBe(false);
  });

  it("publish and unpublish are no-op", async () => {
    await expect(localStorage.publishResource("test-folder/file.txt")).resolves.toBe(true);
    await expect(localStorage.unpublishResource("test-folder/file.txt")).resolves.toBe(true);
  });
});
