import fs from "fs/promises";
import path from "path";
import { describe, it, expect, vi } from "vitest";

import { cleanupLocalFile, cleanupStorageResources } from "../../../src/modules/platform/storage/storage.cleanup.js";

describe("storage.cleanup coverage", () => {
  it("cleans existing local file", async () => {
    const filePath = path.join(process.cwd(), "uploads", "temp", `cleanup-${Date.now()}.txt`);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "test");

    await expect(cleanupLocalFile(filePath)).resolves.toBeUndefined();
    await expect(fs.access(filePath)).rejects.toBeTruthy();
  });

  it("ignores missing local file", async () => {
    await expect(cleanupLocalFile("/tmp/not-existing-file.txt")).resolves.toBeUndefined();
  });

  it("cleans storage resources with delete function", async () => {
    const deleteFunction = vi.fn().mockResolvedValue(undefined);

    await expect(cleanupStorageResources(["a.txt", "b.txt"], deleteFunction)).resolves.toBeUndefined();

    expect(deleteFunction).toHaveBeenCalledWith("a.txt");
    expect(deleteFunction).toHaveBeenCalledWith("b.txt");
  });

  it("continues when storage cleanup fails", async () => {
    const deleteFunction = vi.fn().mockRejectedValue(new Error("delete failed"));

    await expect(cleanupStorageResources(["a.txt"], deleteFunction)).resolves.toBeUndefined();

    expect(deleteFunction).toHaveBeenCalledWith("a.txt");
  });
});
