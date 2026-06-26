import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

let localStorage;
let tempRoot;

const loadLocalStorage = async () => {
  vi.resetModules();

  tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "local-storage-edge-"));

  vi.doMock("../../../src/modules/platform/storage/storage.config.js", () => ({
    storageConfig: {
      provider: "LOCAL",
      appRoot: "/PlastifayERPTest",
      localRoot: tempRoot,
    },
  }));

  localStorage = await import("../../../src/modules/platform/storage/providers/localStorage.service.js");
};

beforeEach(async () => {
  await loadLocalStorage();
});

afterEach(async () => {
  vi.doUnmock("../../../src/modules/platform/storage/storage.config.js");
  vi.resetModules();

  if (tempRoot) {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
});

describe("localStorage.service edge cases", () => {
  it("rejects empty storage path", async () => {
    await expect(localStorage.getResourceInfo("")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects null byte path", async () => {
    await expect(localStorage.getResourceInfo("safe\0bad.pdf")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects relative path traversal", () => {
    expect(() => localStorage.buildPath("safe", "..", "bad.pdf")).toThrow("Path traversal tespit edildi.");
  });

  it("rejects absolute path traversal segments", async () => {
    await expect(localStorage.getResourceInfo("/safe/../bad.pdf")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects access outside storage root", async () => {
    const outsidePath = path.join(os.tmpdir(), `outside-${Date.now()}.pdf`);
    await fs.writeFile(outsidePath, "outside");

    try {
      await expect(localStorage.getResourceInfo(outsidePath)).rejects.toMatchObject({
        statusCode: 400,
        message: "Storage root dışına erişim engellendi.",
      });
    } finally {
      await fs.rm(outsidePath, { force: true });
    }
  });

  it("rejects upload when target exists and overwrite is false", async () => {
    const source = path.join(tempRoot, "source.pdf");
    await fs.writeFile(source, "first");

    const target = localStorage.buildPath("folder", "same.pdf");

    await localStorage.uploadFile({
      localFilePath: source,
      storagePath: target,
      overwrite: true,
    });

    await expect(
      localStorage.uploadFile({
        localFilePath: source,
        storagePath: target,
        overwrite: false,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("rejects move when target exists and overwrite is false", async () => {
    const from = localStorage.buildPath("move", "from.txt");
    const to = localStorage.buildPath("move", "to.txt");

    await fs.mkdir(path.dirname(from), { recursive: true });
    await fs.writeFile(from, "from");
    await fs.writeFile(to, "to");

    await expect(
      localStorage.moveResource({
        fromPath: from,
        toPath: to,
        overwrite: false,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("rejects copy when target exists and overwrite is false", async () => {
    const from = localStorage.buildPath("copy", "from.txt");
    const to = localStorage.buildPath("copy", "to.txt");

    await fs.mkdir(path.dirname(from), { recursive: true });
    await fs.writeFile(from, "from");
    await fs.writeFile(to, "to");

    await expect(
      localStorage.copyResource({
        fromPath: from,
        toPath: to,
        overwrite: false,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("rejects symlink resource info", async () => {
    const realFile = localStorage.buildPath("links", "real.txt");
    const linkFile = localStorage.buildPath("links", "link.txt");

    await fs.mkdir(path.dirname(realFile), { recursive: true });
    await fs.writeFile(realFile, "safe");
    await fs.symlink(realFile, linkFile);

    await expect(localStorage.getResourceInfo(linkFile)).rejects.toMatchObject({
      statusCode: 400,
      message: "Symlink kaynaklarına erişim engellendi.",
    });
  });

  it("does not delete storage root", async () => {
    await expect(localStorage.deleteFile(tempRoot)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("returns true when deleting missing resource", async () => {
    await expect(localStorage.deleteFile(localStorage.buildPath("missing.txt"))).resolves.toBe(true);
  });
});
