import { describe, it, expect, vi } from "vitest";

import { uploadTempFiles } from "../../src/middlewares/uploadTempFiles.middleware.js";

const runSingleUploadMiddleware = (file) => {
  return new Promise((resolve) => {
    const req = {};
    const res = {};
    const next = vi.fn((error) => resolve({ req, error }));

    uploadTempFiles.single("file")(req, res, next);

    req.emit?.("data", file);
    resolve({ req, error: undefined });
  });
};

describe("uploadTempFiles middleware security", () => {
  it("exports multer instance", () => {
    expect(uploadTempFiles).toBeTruthy();
    expect(typeof uploadTempFiles.single).toBe("function");
    expect(typeof uploadTempFiles.array).toBe("function");
  });

  it("has expected upload limits", () => {
    expect(uploadTempFiles.limits.fileSize).toBe(10 * 1024 * 1024);
    expect(uploadTempFiles.limits.files).toBe(10);
  });
});
