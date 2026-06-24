import { describe, it, expect } from "vitest";
import fs from "fs/promises";
import path from "path";

import { uploadFile, moveResource, copyResource } from "../../src/modules/platform/storage/providers/localStorage.service.js";

describe("localStorage.service branch coverage", () => {
  it("throws when upload target exists and overwrite disabled", async () => {
    const tempDir = path.join(process.cwd(), `tmp-upload-${Date.now()}`);

    await fs.mkdir(tempDir, { recursive: true });

    const sourceFile = path.join(tempDir, "source.txt");
    const targetFile = path.join(tempDir, "target.txt");

    await fs.writeFile(sourceFile, "source");
    await fs.writeFile(targetFile, "target");

    await expect(
      uploadFile({
        localFilePath: sourceFile,
        storagePath: targetFile,
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

    const fromPath = path.join(tempDir, "from.txt");
    const toPath = path.join(tempDir, "to.txt");

    await fs.writeFile(fromPath, "from");
    await fs.writeFile(toPath, "to");

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

    const fromPath = path.join(tempDir, "from.txt");
    const toPath = path.join(tempDir, "to.txt");

    await fs.writeFile(fromPath, "from");
    await fs.writeFile(toPath, "to");

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
        storagePath: "/tmp/target.txt",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
