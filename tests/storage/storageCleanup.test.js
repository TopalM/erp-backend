import { describe, it, expect, vi } from "vitest";
import fs from "fs/promises";
import path from "path";

import { cleanupLocalFile, cleanupStorageResources } from "../../src/modules/platform/storage/storage.cleanup.js";

describe("storage cleanup", () => {
  it("removes local file", async () => {
    const filePath = path.join(process.cwd(), `cleanup-test-${Date.now()}.txt`);

    await fs.writeFile(filePath, "test");

    await cleanupLocalFile(filePath);

    await expect(fs.access(filePath)).rejects.toBeTruthy();
  });

  it("ignores missing file", async () => {
    await expect(cleanupLocalFile("/tmp/not-existing-file.txt")).resolves.not.toThrow;
  });

  it("continues when deleteFunction throws", async () => {
    const deleteFunction = vi.fn().mockResolvedValueOnce().mockRejectedValueOnce(new Error("fail"));

    await cleanupStorageResources(["file1", "file2"], deleteFunction);

    expect(deleteFunction).toHaveBeenCalledTimes(2);
  });
});
