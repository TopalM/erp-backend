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

  it("rejects unsupported file extension", async () => {
    const res = await request(app).post("/upload").attach("file", Buffer.from("test"), "test.exe");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Desteklenmeyen dosya formatı.");
  });
});
