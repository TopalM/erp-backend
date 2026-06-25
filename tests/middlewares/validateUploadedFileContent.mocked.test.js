import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

let tempDir;

const createTempFile = async (name, content = "content") => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "validate-upload-mocked-"));
  const filePath = path.join(tempDir, name);
  await fs.writeFile(filePath, content);
  return filePath;
};

const createNext = () => vi.fn();

afterEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.doUnmock("file-type");

  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
});

describe("validateUploadedFileContent mocked branches", () => {
  it("rejects protected file when detected type is missing", async () => {
    vi.doMock("file-type", () => ({
      fileTypeFromFile: vi.fn().mockResolvedValue(undefined),
    }));

    const { validateUploadedFileContent } = await import("../../src/middlewares/validateUploadedFileContent.middleware.js");

    const filePath = await createTempFile("unknown.pdf", "not-a-real-pdf");
    const next = createNext();

    await validateUploadedFileContent(
      {
        file: {
          originalname: "unknown.pdf",
          path: filePath,
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: "Dosya içeriği uzantı ile uyumlu değil.",
      }),
    );
  });

  it("rejects protected file when detected mime does not match extension", async () => {
    vi.doMock("file-type", () => ({
      fileTypeFromFile: vi.fn().mockResolvedValue({ mime: "image/png" }),
    }));

    const { validateUploadedFileContent } = await import("../../src/middlewares/validateUploadedFileContent.middleware.js");

    const filePath = await createTempFile("fake.pdf", "fake-content");
    const next = createNext();

    await validateUploadedFileContent(
      {
        file: {
          originalname: "fake.pdf",
          path: filePath,
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
      }),
    );
  });

  it("passes file type detection errors to next", async () => {
    const error = new Error("file type failed");

    vi.doMock("file-type", () => ({
      fileTypeFromFile: vi.fn().mockRejectedValue(error),
    }));

    const { validateUploadedFileContent } = await import("../../src/middlewares/validateUploadedFileContent.middleware.js");

    const filePath = await createTempFile("broken.pdf", "fake-content");
    const next = createNext();

    await validateUploadedFileContent(
      {
        file: {
          originalname: "broken.pdf",
          path: filePath,
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});
