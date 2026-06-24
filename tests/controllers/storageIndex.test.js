import { describe, it, expect } from "vitest";

import * as storageIndex from "../../src/modules/platform/storage/index.js";

describe("storage index exports", () => {
  it("exports storage functions", () => {
    expect(typeof storageIndex.buildStoragePath).toBe("function");
    expect(typeof storageIndex.ensureStorageFolder).toBe("function");
    expect(typeof storageIndex.uploadFile).toBe("function");
    expect(typeof storageIndex.deleteFile).toBe("function");
    expect(typeof storageIndex.getDownloadUrl).toBe("function");
  });
});
