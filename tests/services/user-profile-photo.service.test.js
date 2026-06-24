import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect } from "vitest";

import { uploadProfilePhoto, removeProfilePhoto } from "../../src/modules/auth/users/user.service.js";
import { createTestUser } from "../setup/factories.js";
import { prisma } from "../../src/database/prisma.client.js";

const makeTempImage = () => {
  const filePath = path.join(os.tmpdir(), `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`);
  fs.writeFileSync(filePath, "fake image content");

  return {
    path: filePath,
    originalname: "profile.png",
    mimetype: "image/png",
    size: fs.statSync(filePath).size,
  };
};

describe("user profile photo service", () => {
  it("rejects missing file", async () => {
    const user = await createTestUser();

    await expect(uploadProfilePhoto(user.id, null)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects missing user and cleans local file", async () => {
    const file = makeTempImage();

    await expect(uploadProfilePhoto("missing-user-id", file)).rejects.toMatchObject({
      statusCode: 404,
    });

    expect(fs.existsSync(file.path)).toBe(false);
  });

  it("uploads profile photo and removes temp file", async () => {
    const user = await createTestUser();
    const file = makeTempImage();

    const updated = await uploadProfilePhoto(user.id, file);

    expect(updated.profilePhotoUrl).toContain("users/profile-photos");
    expect(fs.existsSync(file.path)).toBe(false);
  });

  it("removes profile photo", async () => {
    const user = await createTestUser();
    const file = makeTempImage();

    await uploadProfilePhoto(user.id, file);

    const removed = await removeProfilePhoto(user.id);

    expect(removed.profilePhotoUrl).toBeNull();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(dbUser.profilePhotoUrl).toBeNull();
  });

  it("rejects remove for missing user", async () => {
    await expect(removeProfilePhoto("missing-user-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
