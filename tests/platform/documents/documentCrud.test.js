import bcrypt from "bcryptjs";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import app from "../../../src/app.js";
import { env } from "../../../src/config/env.js";
import { prisma } from "../../../src/database/prisma.client.js";
import { ROLES } from "../../../src/constants/roles.js";

const uploaderEmail = "document-uploader-test@plastifay.com.tr";
const password = "Test12345";
const testEntityId = "document-test-entity-001";

const testUploadDir = "tests/tmp";
const testPdfPath = path.join(testUploadDir, "document-test.pdf");
const testInvalidPath = path.join(testUploadDir, "document-test.exe");

const createUser = async ({ email, roleName = ROLES.ADMIN }) => {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Document",
      lastName: "Test",
      email,
      passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      tokenVersion: 0,
      roleId: role.id,
    },
    include: { role: true },
  });

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      departmentId: user.departmentId,
      tokenVersion: user.tokenVersion,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn },
  );

  return { user, token };
};

const prepareTestFiles = () => {
  if (!fs.existsSync(testUploadDir)) {
    fs.mkdirSync(testUploadDir, { recursive: true });
  }

  fs.writeFileSync(testPdfPath, "%PDF-1.4\n% Test PDF content\n");
  fs.writeFileSync(testInvalidPath, "invalid executable content");
};

const cleanupTestFiles = () => {
  if (fs.existsSync(testPdfPath)) fs.unlinkSync(testPdfPath);
  if (fs.existsSync(testInvalidPath)) fs.unlinkSync(testInvalidPath);
};

describe("Document Platform Tests", () => {
  beforeEach(async () => {
    prepareTestFiles();

    await prisma.document.deleteMany({
      where: {
        entityId: {
          contains: "document-test-entity",
        },
      },
    });

    await prisma.authEventLog.deleteMany({ where: { email: uploaderEmail } });
    await prisma.user.deleteMany({ where: { email: uploaderEmail } });
  });

  afterEach(async () => {
    cleanupTestFiles();
  });

  it("should upload document", async () => {
    const { token, user } = await createUser({ email: uploaderEmail });

    const response = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${token}`)
      .field("module", "SUPPLIER")
      .field("entityType", "SUPPLIER")
      .field("entityId", testEntityId)
      .field("documentType", "ISO_9001")
      .field("title", "ISO 9001 Test Belgesi")
      .field("description", "Test doküman yükleme")
      .attach("file", testPdfPath);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.entityId).toBe(testEntityId);
    expect(response.body.data.documentType).toBe("ISO_9001");
    expect(response.body.data.uploadedById).toBe(user.id);
    expect(response.body.data.filePath).toBeTruthy();
  });

  it("should list documents by entity", async () => {
    const { token, user } = await createUser({ email: uploaderEmail });

    await prisma.document.create({
      data: {
        module: "SUPPLIER",
        entityType: "SUPPLIER",
        entityId: testEntityId,
        documentType: "ISO_9001",
        title: "Liste Test Belgesi",
        originalFileName: "test.pdf",
        storedFileName: "stored-test.pdf",
        filePath: "test/path/stored-test.pdf",
        mimeType: "application/pdf",
        fileExtension: ".pdf",
        sizeBytes: 10,
        storageProvider: "LOCAL",
        uploadedById: user.id,
      },
    });

    const response = await request(app)
      .get("/api/documents")
      .query({ module: "SUPPLIER", entityType: "SUPPLIER", entityId: testEntityId })
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0].uploadedBy.email).toBe(uploaderEmail);
  });

  it("should get document detail", async () => {
    const { token } = await createUser({ email: uploaderEmail });

    const document = await prisma.document.create({
      data: {
        module: "SUPPLIER",
        entityType: "SUPPLIER",
        entityId: testEntityId,
        documentType: "ISO_9001",
        title: "Detay Test Belgesi",
        originalFileName: "test.pdf",
        storedFileName: "stored-test.pdf",
        filePath: "test/path/stored-test.pdf",
        mimeType: "application/pdf",
        fileExtension: ".pdf",
        sizeBytes: 10,
        storageProvider: "LOCAL",
      },
    });

    const response = await request(app).get(`/api/documents/${document.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(document.id);
  });

  it("should deactivate document", async () => {
    const { token } = await createUser({ email: uploaderEmail });

    const document = await prisma.document.create({
      data: {
        module: "SUPPLIER",
        entityType: "SUPPLIER",
        entityId: testEntityId,
        documentType: "ISO_9001",
        title: "Silme Test Belgesi",
        originalFileName: "test.pdf",
        storedFileName: "stored-test.pdf",
        filePath: "test/path/stored-test.pdf",
        mimeType: "application/pdf",
        fileExtension: ".pdf",
        sizeBytes: 10,
        storageProvider: "LOCAL",
      },
    });

    const response = await request(app).delete(`/api/documents/${document.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.isActive).toBe(false);
  });

  it("should reject upload without file", async () => {
    const { token } = await createUser({ email: uploaderEmail });

    const response = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${token}`)
      .field("module", "SUPPLIER")
      .field("entityType", "SUPPLIER")
      .field("entityId", testEntityId)
      .field("documentType", "ISO_9001");

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject unsupported file extension", async () => {
    const { token } = await createUser({ email: uploaderEmail });

    const response = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${token}`)
      .field("module", "SUPPLIER")
      .field("entityType", "SUPPLIER")
      .field("entityId", testEntityId)
      .field("documentType", "ISO_9001")
      .attach("file", testInvalidPath);

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject document list without token", async () => {
    const response = await request(app).get("/api/documents");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
