import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import { validateUploadedFileContent } from "../../src/middlewares/validateUploadedFileContent.middleware.js";

const tempDirs = [];

const minimalPdfContent = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n");
const minimalPngContent = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const createNext = () => vi.fn();

const createTempFile = async (name, content = minimalPdfContent) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "validate-upload-"));
  tempDirs.push(tempDir);
  const filePath = path.join(tempDir, name);
  await fs.writeFile(filePath, content);
  return filePath;
};

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) =>
      fs.rm(dir, {
        recursive: true,
        force: true,
      }),
    ),
  );
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

  it("rejects unsafe filename with slash", async () => {
    const filePath = await createTempFile("safe.pdf");
    const next = createNext();

    await validateUploadedFileContent(
      {
        file: {
          originalname: "../evil.pdf",
          path: filePath,
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: "Dosya adı güvenli değil.",
      }),
    );
  });

  it("rejects unsafe filename with backslash", async () => {
    const filePath = await createTempFile("safe.pdf");
    const next = createNext();

    await validateUploadedFileContent(
      {
        file: {
          originalname: "..\\evil.pdf",
          path: filePath,
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: "Dosya adı güvenli değil.",
      }),
    );
  });

  it("rejects dangerous final extension", async () => {
    const filePath = await createTempFile("payload.exe", "fake");
    const next = createNext();

    await validateUploadedFileContent(
      {
        file: {
          originalname: "payload.exe",
          path: filePath,
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: "Dosya adı güvenli değil.",
      }),
    );
  });

  it("rejects dangerous middle extension", async () => {
    const filePath = await createTempFile("invoice.exe.pdf");
    const next = createNext();

    await validateUploadedFileContent(
      {
        file: {
          originalname: "invoice.exe.pdf",
          path: filePath,
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: "Dosya adı güvenli değil.",
      }),
    );
  });

  it("validates array uploads from req.files", async () => {
    const firstPath = await createTempFile("first.pdf", minimalPdfContent);
    const secondPath = await createTempFile("second.pdf", minimalPdfContent);
    const next = createNext();

    await validateUploadedFileContent(
      {
        files: [
          {
            originalname: "first.pdf",
            path: firstPath,
          },
          {
            originalname: "second.pdf",
            path: secondPath,
          },
        ],
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });

  it("validates object uploads from req.files", async () => {
    const firstPath = await createTempFile("first.pdf", minimalPdfContent);
    const secondPath = await createTempFile("second.pdf", minimalPdfContent);
    const next = createNext();

    await validateUploadedFileContent(
      {
        files: {
          documents: [
            {
              originalname: "first.pdf",
              path: firstPath,
            },
          ],
          photos: [
            {
              originalname: "second.pdf",
              path: secondPath,
            },
          ],
        },
      },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });
});
