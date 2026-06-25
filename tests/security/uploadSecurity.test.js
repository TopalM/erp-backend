import { describe, it, expect } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const minimalJpgContent = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const minimalPngContent = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const minimalWebpContent = Buffer.from("RIFF\x1a\x00\x00\x00WEBPVP8 ");
const minimalPdfContent = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n");
const validPngContent = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64");

const validJpgContent = Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2w==", "base64");

const endpoint = "/api/documents";

const createUploader = () =>
  createTestUser({
    permissions: [PERMISSIONS.DOCUMENT_CREATE, PERMISSIONS.SYSTEM_LOG_READ],
  });

const basePayload = () => ({
  module: "SYSTEM",
  entityType: "OTHER",
  entityId: `upload-security-${Date.now()}-${Math.random()}`,
  documentType: "OTHER",
  title: "Upload Security Test",
});

const createTempFile = async (filename, content = minimalPdfContent) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "erp-upload-security-"));
  const filePath = path.join(dir, filename.replaceAll("/", "_").replaceAll("\\", "_"));
  await fs.writeFile(filePath, content);
  return filePath;
};

const getDefaultContentForFile = (filename) => {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return validJpgContent;
  if (lower.endsWith(".png")) return validPngContent;

  return minimalPdfContent;
};

const uploadFile = async ({ user, filename, content = getDefaultContentForFile(filename), mimeType = "application/pdf" }) => {
  const filePath = await createTempFile(filename, content);

  return api().post(endpoint).set("Authorization", authHeader(user)).field(basePayload()).attach("file", filePath, {
    filename,
    contentType: mimeType,
  });
};

describe("upload security", () => {
  describe("unsupported extensions", () => {
    const blockedFiles = ["evil.exe", "virus.bat", "hack.ps1", "payload.js", "payload.ts", "script.sh", "payload.php", "payload.jsp", "payload.aspx"];

    it.each(blockedFiles)("rejects unsupported extension: %s", async (filename) => {
      const user = await createUploader();

      const res = await uploadFile({
        user,
        filename,
        mimeType: "application/octet-stream",
      });

      expect([400, 415]).toContain(res.status);
    });
  });

  describe("double extensions", () => {
    const blockedFiles = ["invoice.pdf.exe", "photo.jpg.php", "report.docx.sh", "abc.png.exe"];

    it.each(blockedFiles)("rejects dangerous double extension: %s", async (filename) => {
      const user = await createUploader();

      const res = await uploadFile({
        user,
        filename,
        mimeType: "application/octet-stream",
      });

      expect([400, 415]).toContain(res.status);
    });
  });

  describe("allowed uppercase extensions", () => {
    const allowedFiles = [
      ["TEST.PDF", "application/pdf"],
      ["PHOTO.JPG", "image/jpeg"],
      ["IMAGE.PNG", "image/png"],
      ["SHEET.XLSX", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      ["DOC.DOCX", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    ];

    it.each(allowedFiles)("allows uppercase extension: %s", async (filename, mimeType) => {
      const user = await createUploader();

      const res = await uploadFile({
        user,
        filename,
        mimeType,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.originalFileName).toBeTruthy();
    });
  });

  describe("weird filenames", () => {
    const blockedFiles = ["photo.jpg.", "photo.", "photo", "archive.tar.gz", "document.docx."];

    it.each(blockedFiles)("rejects invalid filename or extension: %s", async (filename) => {
      const user = await createUploader();

      const res = await uploadFile({
        user,
        filename,
        mimeType: "application/octet-stream",
      });

      expect([400, 415]).toContain(res.status);
    });
  });

  describe("hidden files", () => {
    const blockedFiles = [".env", ".gitignore", ".htaccess"];

    it.each(blockedFiles)("rejects hidden file: %s", async (filename) => {
      const user = await createUploader();

      const res = await uploadFile({
        user,
        filename,
        mimeType: "text/plain",
      });

      expect([400, 415]).toContain(res.status);
    });
  });

  describe("path traversal filenames", () => {
    const dangerousFiles = ["../../../etc/passwd.pdf", "../../app.js.pdf", "..\\..\\windows.pdf", "C:\\Windows\\System32\\cmd.pdf"];

    it.each(dangerousFiles)("sanitizes path traversal filename: %s", async (filename) => {
      const user = await createUploader();

      const res = await uploadFile({
        user,
        filename,
        mimeType: "application/pdf",
      });

      expect(res.status).toBe(201);

      const body = JSON.stringify(res.body);
      expect(body).not.toContain("../");
      expect(body).not.toContain("..\\");
      expect(body).not.toContain("C:\\");
      expect(res.body.data.originalFileName).not.toContain("/");
      expect(res.body.data.originalFileName).not.toContain("\\");
    });
  });

  describe("unicode filenames", () => {
    const allowedFiles = ["şğüİĞ.pdf", "测试.pdf", "😀.jpg"];

    it.each(allowedFiles)("handles unicode filename safely: %s", async (filename) => {
      const user = await createUploader();

      const res = await uploadFile({
        user,
        filename,
        mimeType: filename.endsWith(".jpg") ? "image/jpeg" : "application/pdf",
      });

      expect(res.status).toBe(201);
      expect(res.body.data.originalFileName).toBeTruthy();
    });
  });

  describe("long filename", () => {
    it("handles very long filename safely", async () => {
      const user = await createUploader();
      const filename = `${"a".repeat(240)}.pdf`;

      const res = await uploadFile({
        user,
        filename,
        mimeType: "application/pdf",
      });

      expect([201, 400]).toContain(res.status);

      if (res.status === 201) {
        expect(res.body.data.originalFileName.length).toBeLessThanOrEqual(255);
      }
    });
  });

  describe("empty file", () => {
    it("handles zero byte file deterministically", async () => {
      const user = await createUploader();

      const res = await uploadFile({
        user,
        filename: "empty.pdf",
        content: "",
        mimeType: "application/pdf",
      });

      expect([201, 400]).toContain(res.status);
    });
  });

  describe("large file", () => {
    it("rejects file larger than 10MB", async () => {
      const user = await createUploader();
      const largeContent = Buffer.alloc(11 * 1024 * 1024, "a");

      const res = await uploadFile({
        user,
        filename: "large.pdf",
        content: largeContent,
        mimeType: "application/pdf",
      });

      expect([400, 413]).toContain(res.status);
    });
  });

  describe("mime spoofing", () => {
    it("rejects unsupported extension even when mime type is allowed", async () => {
      const user = await createUploader();

      const res = await uploadFile({
        user,
        filename: "payload.exe",
        content: "fake image content",
        mimeType: "image/png",
      });

      expect([400, 415]).toContain(res.status);
    });

    it("rejects allowed extension when file content does not match magic bytes", async () => {
      const user = await createUploader();

      const res = await uploadFile({
        user,
        filename: "script-looking.pdf",
        content: "#!/bin/bash\necho hacked",
        mimeType: "application/pdf",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Dosya içeriği uzantı ile uyumlu değil.");
    });
  });

  describe("invalid multipart", () => {
    it("rejects request without uploaded file", async () => {
      const user = await createUploader();

      const res = await api().post(endpoint).set("Authorization", authHeader(user)).field(basePayload());

      expect([400, 422]).toContain(res.status);
    });
  });

  describe("too many files", () => {
    it("does not accept more than configured document upload field", async () => {
      const user = await createUploader();

      const first = await createTempFile("first.pdf");
      const second = await createTempFile("second.pdf");

      const res = await api()
        .post(endpoint)
        .set("Authorization", authHeader(user))
        .field(basePayload())
        .attach("file", first, {
          filename: "first.pdf",
          contentType: "application/pdf",
        })
        .attach("file", second, {
          filename: "second.pdf",
          contentType: "application/pdf",
        });

      expect([201, 400]).toContain(res.status);
    });
  });

  describe("duplicate filenames", () => {
    it("stores duplicate original filenames with unique stored filename", async () => {
      const user = await createUploader();

      const res1 = await uploadFile({
        user,
        filename: "duplicate.pdf",

        mimeType: "application/pdf",
      });

      const res2 = await uploadFile({
        user,
        filename: "duplicate.pdf",

        mimeType: "application/pdf",
      });

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);
      expect(res1.body.data.storedFileName).not.toBe(res2.body.data.storedFileName);
    });
  });

  describe("storage metadata leakage", () => {
    it("upload response does not expose temp upload path", async () => {
      const user = await createUploader();

      const res = await uploadFile({
        user,
        filename: "safe.pdf",
        mimeType: "application/pdf",
      });

      expect(res.status).toBe(201);

      const body = JSON.stringify(res.body);
      expect(body).not.toContain("uploads/temp");
      expect(body).not.toContain("/tmp/");
    });
  });
});
