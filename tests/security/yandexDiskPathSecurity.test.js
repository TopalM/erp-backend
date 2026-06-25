import { describe, it, expect } from "vitest";

import { buildPath } from "../../src/modules/platform/storage/providers/yandexDisk.service.js";

describe("yandexDisk path security", () => {
  it("rejects parent directory traversal", () => {
    expect(() => buildPath("../secret.txt")).toThrow();
    expect(() => buildPath("safe/../../secret.txt")).toThrow();
  });

  it("rejects dot path segments", () => {
    expect(() => buildPath("./secret.txt")).toThrow();
    expect(() => buildPath("safe/./secret.txt")).toThrow();
  });

  it("rejects null byte", () => {
    expect(() => buildPath("safe/file.txt\0.png")).toThrow();
  });

  it("rejects disk scheme injection", () => {
    expect(() => buildPath("disk:/outside.txt")).toThrow();
    expect(() => buildPath("safe/disk:/outside.txt")).toThrow();
  });

  it("normalizes backslashes to yandex disk path separators", () => {
    expect(buildPath("safe\\folder\\file.txt")).toContain("/safe/folder/file.txt");
  });
});
