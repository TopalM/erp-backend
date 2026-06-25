import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";

import { uploadTempFiles } from "../../src/middlewares/uploadTempFiles.middleware.js";

const app = express();

app.post("/upload", uploadTempFiles.single("file"), (req, res) => {
  res.status(200).json({
    filename: req.file.filename,
    originalname: req.file.originalname,
  });
});

app.post("/upload-many", uploadTempFiles.array("files", 10), (req, res) => {
  res.status(200).json({
    count: req.files.length,
    filenames: req.files.map((file) => file.filename),
  });
});

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    message: error.message,
  });
});

describe("uploadTempFiles.middleware coverage", () => {
  it("accepts allowed file extension", async () => {
    const res = await request(app).post("/upload").attach("file", Buffer.from("test"), "test.pdf");

    expect(res.status).toBe(200);
    expect(res.body.filename).toContain("test.pdf");
  });

  it("sanitizes filename", async () => {
    const res = await request(app).post("/upload").attach("file", Buffer.from("test"), "te@#st file.pdf");

    expect(res.status).toBe(200);
    expect(res.body.filename).not.toContain("@");
    expect(res.body.filename).not.toContain("#");
    expect(res.body.filename).toContain("te-st file.pdf");
  });

  it("accepts multiple files", async () => {
    const res = await request(app).post("/upload-many").attach("files", Buffer.from("a"), "a.pdf").attach("files", Buffer.from("b"), "b.png");

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.filenames[0]).toContain("a.pdf");
    expect(res.body.filenames[1]).toContain("b.png");
  });

  it("rejects unsupported file extension", async () => {
    const res = await request(app).post("/upload").attach("file", Buffer.from("test"), "test.exe");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Desteklenmeyen dosya uzantısı.");
  });
});
