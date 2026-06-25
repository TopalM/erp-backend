import { describe, it, expect, afterEach } from "vitest";
import fs from "fs/promises";
import path from "path";

import { uploadFile, moveResource, copyResource, deleteFile } from "../../src/modules/platform/storage/providers/localStorage.service.js";

describe("localStorage.service branch coverage", () => {
  const cleanupTargets = ["branch-test/upload", "branch-test/move", "branch-test/copy"];

  afterEach(async () => {
    await Promise.all(cleanupTargets.map((target) => deleteFile(target)));
  });

  it("throws when upload target exists and overwrite disabled", async () => {
    const tempDir = path.join(process.cwd(), `tmp-upload-${Date.now()}`);

    await fs.mkdir(tempDir, { recursive: true });

    const sourceFile = path.join(tempDir, "source.txt");
    const targetPath = "branch-test/upload/target.txt";

    await fs.writeFile(sourceFile, "source");

    await uploadFile({
      localFilePath: sourceFile,
      storagePath: targetPath,
    });

    await expect(
      uploadFile({
        localFilePath: sourceFile,
        storagePath: targetPath,
        overwrite: false,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });

    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  });

  it("throws when move target exists and overwrite disabled", async () => {
    const tempDir = path.join(process.cwd(), `tmp-move-${Date.now()}`);

    await fs.mkdir(tempDir, { recursive: true });

    const sourceFile = path.join(tempDir, "source.txt");
    const fromPath = "branch-test/move/from.txt";
    const toPath = "branch-test/move/to.txt";

    await fs.writeFile(sourceFile, "source");

    await uploadFile({
      localFilePath: sourceFile,
      storagePath: fromPath,
    });

    await uploadFile({
      localFilePath: sourceFile,
      storagePath: toPath,
    });

    await expect(
      moveResource({
        fromPath,
        toPath,
        overwrite: false,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });

    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  });

  it("throws when copy target exists and overwrite disabled", async () => {
    const tempDir = path.join(process.cwd(), `tmp-copy-${Date.now()}`);

    await fs.mkdir(tempDir, { recursive: true });

    const sourceFile = path.join(tempDir, "source.txt");
    const fromPath = "branch-test/copy/from.txt";
    const toPath = "branch-test/copy/to.txt";

    await fs.writeFile(sourceFile, "source");

    await uploadFile({
      localFilePath: sourceFile,
      storagePath: fromPath,
    });

    await uploadFile({
      localFilePath: sourceFile,
      storagePath: toPath,
    });

    await expect(
      copyResource({
        fromPath,
        toPath,
        overwrite: false,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });

    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  });

  it("throws when upload source file does not exist", async () => {
    await expect(
      uploadFile({
        localFilePath: "/tmp/not-found.txt",
        storagePath: "branch-test/missing/target.txt",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
