import { describe, it, expect } from "vitest";

import * as storageService from "../../src/modules/platform/storage/storage.service.js";

describe("storage service", () => {
  it("exports ensureStorageFolder", () => {
    expect(storageService.ensureStorageFolder).toBeTypeOf("function");
  });

  it("exports uploadFile", () => {
    expect(storageService.uploadFile).toBeTypeOf("function");
  });

  it("exports deleteFile", () => {
    expect(storageService.deleteFile).toBeTypeOf("function");
  });

  it("exports getDownloadUrl", () => {
    expect(storageService.getDownloadUrl).toBeTypeOf("function");
  });

  it("exports resourceExists", () => {
    expect(storageService.resourceExists).toBeTypeOf("function");
  });

  it("exports moveResource", () => {
    expect(storageService.moveResource).toBeTypeOf("function");
  });

  it("exports copyResource", () => {
    expect(storageService.copyResource).toBeTypeOf("function");
  });
});
