import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import { validateUploadedFileContent } from "../../src/middlewares/validateUploadedFileContent.middleware.js";

let tempDir;

const minimalPdfContent = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n");
const minimalPngContent = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const createNext = () => vi.fn();

const createTempFile = async (name, content = minimalPdfContent) => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "validate-upload-"));
  const filePath = path.join(tempDir, name);
  await fs.writeFile(filePath, content);
  return filePath;
};

afterEach(async () => {
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
});

describe("validateUploadedFileContent middleware", () => {
  it("skips validation when no file exists", async () => {
    const next = createNext();

    await validateUploadedFileContent({ file: null }, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("skips magic byte validation for extensions that do not require it", async () => {
    const next = createNext();

    await validateUploadedFileContent(
      {
        file: {
          originalname: "document.docx",
          path: "/tmp/document.docx",
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });

  it("rejects zero byte protected file", async () => {
    const filePath = await createTempFile("empty.pdf", "");
    const next = createNext();

    await validateUploadedFileContent(
      {
        file: {
          originalname: "empty.pdf",
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

  it("rejects protected file when file type cannot be detected", async () => {
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

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it("rejects protected file when detected mime does not match extension", async () => {
    const filePath = await createTempFile("fake.pdf", minimalPngContent);
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

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it("allows protected file when detected mime matches extension", async () => {
    const filePath = await createTempFile("valid.pdf", minimalPdfContent);
    const next = createNext();

    await validateUploadedFileContent(
      {
        file: {
          originalname: "valid.pdf",
          path: filePath,
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });

  it("passes unexpected errors to next", async () => {
    const next = createNext();

    await validateUploadedFileContent(
      {
        file: {
          originalname: "broken.pdf",
          path: "/tmp/not-exist-broken.pdf",
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ code: "ENOENT" }));
  });
});
