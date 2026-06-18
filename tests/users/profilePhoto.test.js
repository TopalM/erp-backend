import bcrypt from "bcryptjs";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";
import { deleteFile } from "../../src/modules/platform/storage/storage.service.js";

const profilePhotoEmail = "profile-photo-test@plastifay.com.tr";
const password = "Test12345";

const testUploadDir = "tests/tmp";
const testImagePath = path.join(testUploadDir, "test-profile.png");
const testTextPath = path.join(testUploadDir, "test-profile.txt");

const createProfilePhotoUser = async () => {
  const role = await prisma.role.findUnique({
    where: {
      name: ROLES.VIEWER,
    },
  });

  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Profile",
      lastName: "Photo Test",
      email: profilePhotoEmail,
      passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      tokenVersion: 0,
      roleId: role.id,
    },
    include: {
      role: true,
    },
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
    {
      expiresIn: env.jwt.expiresIn,
    },
  );

  return {
    user,
    token,
  };
};

const cleanupProfilePhotoUser = async () => {
  const user = await prisma.user.findUnique({
    where: {
      email: profilePhotoEmail,
    },
  });

  if (user?.profilePhotoUrl) {
    await deleteFile(user.profilePhotoUrl);
  }

  await prisma.authEventLog.deleteMany({
    where: {
      email: profilePhotoEmail,
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: profilePhotoEmail,
    },
  });
};

const prepareTestFiles = () => {
  if (!fs.existsSync(testUploadDir)) {
    fs.mkdirSync(testUploadDir, {
      recursive: true,
    });
  }

  // Minimal PNG dosyası.
  const pngBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64");

  fs.writeFileSync(testImagePath, pngBuffer);
  fs.writeFileSync(testTextPath, "invalid file content");
};

const cleanupTestFiles = () => {
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }

  if (fs.existsSync(testTextPath)) {
    fs.unlinkSync(testTextPath);
  }

  if (fs.existsSync(testUploadDir)) {
    fs.rmSync(testUploadDir, {
      recursive: true,
      force: true,
    });
  }
};

describe("User Profile Photo Tests", () => {
  beforeEach(async () => {
    await cleanupProfilePhotoUser();
    prepareTestFiles();
  });

  afterEach(async () => {
    await cleanupProfilePhotoUser();
    cleanupTestFiles();
  });

  // Kullanıcı profil fotoğrafı yükleyebilmelidir.
  it("should upload profile photo successfully", async () => {
    const { token } = await createProfilePhotoUser();

    const response = await request(app).post("/api/users/profile/photo").set("Authorization", `Bearer ${token}`).attach("photo", testImagePath);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.profilePhotoUrl).toBeTruthy();
    expect(response.body.data.passwordHash).toBeUndefined();
    expect(response.body.data.profilePhotoDownloadUrl).toBeTruthy();
  });

  // Kullanıcı profil fotoğrafını kaldırabilmelidir.
  it("should remove profile photo successfully", async () => {
    const { token } = await createProfilePhotoUser();

    const uploadResponse = await request(app).post("/api/users/profile/photo").set("Authorization", `Bearer ${token}`).attach("photo", testImagePath);

    expect(uploadResponse.statusCode).toBe(200);

    expect(uploadResponse.body.data.profilePhotoUrl).toBeTruthy();
    expect(uploadResponse.body.data.profilePhotoDownloadUrl).toBeTruthy();

    const deleteResponse = await request(app).delete("/api/users/profile/photo").set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.data.profilePhotoUrl).toBeNull();
  });

  // Token olmadan profil fotoğrafı yüklenememelidir.
  it("should reject profile photo upload without token", async () => {
    const response = await request(app).post("/api/users/profile/photo").attach("photo", testImagePath);

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // Dosya gönderilmeden profil fotoğrafı yüklenememelidir.
  it("should reject profile photo upload without file", async () => {
    const { token } = await createProfilePhotoUser();

    const response = await request(app).post("/api/users/profile/photo").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Geçersiz dosya tipi yüklenememelidir.
  it("should reject invalid profile photo file type", async () => {
    const { token } = await createProfilePhotoUser();

    const response = await request(app).post("/api/users/profile/photo").set("Authorization", `Bearer ${token}`).attach("photo", testTextPath);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Token olmadan profil fotoğrafı silinememelidir.
  it("should reject profile photo remove without token", async () => {
    const response = await request(app).delete("/api/users/profile/photo");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
  // SUPER_ADMIN kullanıcı pasif kullanıcıyı aktif edebilmelidir.
});
