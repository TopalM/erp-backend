import { describe, it, expect } from "vitest";
import fs from "fs/promises";
import path from "path";

import {
  buildPath,
  uploadFile,
  deleteFile,
  getDownloadUrl,
  getResourceInfo,
} from "../../src/modules/platform/storage/providers/localStorage.service.js";

import { storageConfig } from "../../src/modules/platform/storage/storage.config.js";

describe("localStorage path traversal security", () => {
  it("rejects parent directory traversal in buildPath", () => {
    expect(() => buildPath("../secret.txt")).toThrow();
    expect(() => buildPath("safe/../../secret.txt")).toThrow();
  });

  it("rejects null byte in storage path", () => {
    expect(() => buildPath("safe/file.txt\0.png")).toThrow();
  });

  it("prevents upload outside storage root", async () => {
    const tempDir = path.join(process.cwd(), `tmp-security-${Date.now()}`);
    const sourceFile = path.join(tempDir, "source.txt");

    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(sourceFile, "source");

    await expect(
      uploadFile({
        localFilePath: sourceFile,
        storagePath: "../outside.txt",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });

    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  });

  it("prevents deleting storage root", async () => {
    await expect(deleteFile("/")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("prevents download url for outside path", async () => {
    await expect(getDownloadUrl("../../etc/passwd")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects symlink resource info", async () => {
    const tempDir = path.join(process.cwd(), `tmp-symlink-${Date.now()}`);
    const realFile = path.join(tempDir, "real.txt");

    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(realFile, "real");

    const symlinkStoragePath = "/PlastifayERP/security/symlink.txt";
    const symlinkAbsolutePath = path.join(path.resolve(storageConfig.localRoot), symlinkStoragePath.replace(/^\/+|\/+$/g, ""));

    await fs.mkdir(path.dirname(symlinkAbsolutePath), { recursive: true });
    await fs.symlink(realFile, symlinkAbsolutePath);

    await expect(getResourceInfo(symlinkStoragePath)).rejects.toMatchObject({
      statusCode: 400,
    });

    await deleteFile("/PlastifayERP/security");

    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  });
});
