import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const originalCwd = process.cwd;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();

  process.cwd = originalCwd;
});

describe("uploadTempFiles.middleware branch coverage", () => {
  it("creates temp upload directory when it does not exist", async () => {
    const existsSync = vi.fn().mockReturnValue(false);
    const mkdirSync = vi.fn();

    vi.doMock("fs", () => ({
      default: {
        existsSync,
        mkdirSync,
      },
      existsSync,
      mkdirSync,
    }));

    await import("../../src/middlewares/uploadTempFiles.middleware.js");

    expect(existsSync).toHaveBeenCalled();
    expect(mkdirSync).toHaveBeenCalledWith(expect.stringContaining("uploads"), {
      recursive: true,
    });
  });

  it("does not create temp upload directory when it already exists", async () => {
    const existsSync = vi.fn().mockReturnValue(true);
    const mkdirSync = vi.fn();

    vi.doMock("fs", () => ({
      default: {
        existsSync,
        mkdirSync,
      },
      existsSync,
      mkdirSync,
    }));

    await import("../../src/middlewares/uploadTempFiles.middleware.js");

    expect(existsSync).toHaveBeenCalled();
    expect(mkdirSync).not.toHaveBeenCalled();
  });
});
