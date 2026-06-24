import { describe, it, expect, vi } from "vitest";
import fs from "fs/promises";
import path from "path";

import { cleanupLocalFile, cleanupStorageResources } from "../../src/modules/platform/storage/storage.cleanup.js";

describe("storage.cleanup coverage", () => {
  it("returns when local file path is empty", async () => {
    await expect(cleanupLocalFile()).resolves.toBeUndefined();
  });

  it("removes local file", async () => {
    const filePath = path.join(process.cwd(), `cleanup-test-${Date.now()}.txt`);

    await fs.writeFile(filePath, "test");

    await cleanupLocalFile(filePath);

    await expect(fs.access(filePath)).rejects.toBeTruthy();
  });

  it("ignores missing local file", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(cleanupLocalFile("/tmp/not-existing-file.txt")).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith("Local file cleanup failed:", expect.any(String));

    consoleSpy.mockRestore();
  });

  it("returns when resources is not array", async () => {
    const deleteFunction = vi.fn();

    await cleanupStorageResources(null, deleteFunction);

    expect(deleteFunction).not.toHaveBeenCalled();
  });

  it("returns when resources is empty array", async () => {
    const deleteFunction = vi.fn();

    await cleanupStorageResources([], deleteFunction);

    expect(deleteFunction).not.toHaveBeenCalled();
  });

  it("cleans all storage resources", async () => {
    const deleteFunction = vi.fn().mockResolvedValue(undefined);

    await cleanupStorageResources(["a.txt", "b.txt"], deleteFunction);

    expect(deleteFunction).toHaveBeenCalledTimes(2);
    expect(deleteFunction).toHaveBeenNthCalledWith(1, "a.txt");
    expect(deleteFunction).toHaveBeenNthCalledWith(2, "b.txt");
  });

  it("continues when storage cleanup fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const deleteFunction = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("delete failed"));

    await cleanupStorageResources(["a.txt", "b.txt"], deleteFunction);

    expect(deleteFunction).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledWith("Storage cleanup failed:", "b.txt", "delete failed");

    consoleSpy.mockRestore();
  });
});
