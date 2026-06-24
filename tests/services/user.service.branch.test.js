import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  role: {
    findUnique: vi.fn(),
  },
  department: {
    findUnique: vi.fn(),
  },
};

const storageMock = {
  buildStoragePath: vi.fn(),
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
  getDownloadUrl: vi.fn(),
  ensureStorageFolder: vi.fn(),
};

const cleanupMock = {
  cleanupLocalFile: vi.fn(),
};

const auditMock = {
  createAuditLog: vi.fn(),
};

const baseUser = {
  id: "user1",
  email: "test@plastifay.com.tr",
  firstName: "Test",
  lastName: "USER",
  passwordHash: "secret",
  isActive: false,
  roleId: "role1",
  departmentId: null,
  tokenVersion: 1,
  preferredTheme: null,
  profilePhotoUrl: null,
  role: { id: "role1", name: "VIEWER" },
  department: null,
  employee: null,
  userPermissions: [],
};

const loadService = async () => {
  vi.resetModules();

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: prismaMock,
  }));

  vi.doMock("../../src/modules/platform/storage/storage.service.js", () => storageMock);

  vi.doMock("../../src/modules/platform/storage/storage.cleanup.js", () => cleanupMock);

  vi.doMock("../../src/modules/platform/audit/audit-logs/audit-log.service.js", () => auditMock);

  return import("../../src/modules/auth/users/user.service.js");
};

beforeEach(() => {
  vi.clearAllMocks();

  prismaMock.user.findMany.mockResolvedValue([baseUser]);
  prismaMock.user.findUnique.mockResolvedValue(baseUser);
  prismaMock.user.update.mockImplementation(async ({ data }) => ({
    ...baseUser,
    ...data,
    isActive: data?.isActive ?? baseUser.isActive,
    tokenVersion: data?.tokenVersion ? baseUser.tokenVersion + 1 : baseUser.tokenVersion,
    roleId: data?.roleId ?? baseUser.roleId,
    departmentId: data?.departmentId ?? baseUser.departmentId,
    profilePhotoUrl: Object.prototype.hasOwnProperty.call(data || {}, "profilePhotoUrl") ? data.profilePhotoUrl : baseUser.profilePhotoUrl,
  }));

  prismaMock.role.findUnique.mockResolvedValue({ id: "role2", name: "ADMIN" });
  prismaMock.department.findUnique.mockResolvedValue({ id: "dep1", name: "IT" });

  storageMock.buildStoragePath.mockReturnValue("users/profile-photos/photo.png");
  storageMock.uploadFile.mockResolvedValue(undefined);
  storageMock.deleteFile.mockResolvedValue(undefined);
  storageMock.getDownloadUrl.mockResolvedValue("https://download.test/photo.png");
  storageMock.ensureStorageFolder.mockResolvedValue(undefined);

  cleanupMock.cleanupLocalFile.mockResolvedValue(undefined);
  auditMock.createAuditLog.mockResolvedValue(undefined);
});

describe("user.service branch coverage", () => {
  it("lists users sanitized", async () => {
    const service = await loadService();

    const result = await service.getUsers();

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      }),
    );
    expect(result[0].passwordHash).toBeUndefined();
  });

  it("lists pending users sanitized", async () => {
    const service = await loadService();

    const result = await service.getPendingUsers();

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: false },
      }),
    );
    expect(result[0].passwordHash).toBeUndefined();
  });

  it("throws when activating missing user", async () => {
    const service = await loadService();

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.activateUser("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("throws when activating user without role", async () => {
    const service = await loadService();

    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...baseUser,
      roleId: null,
    });

    await expect(service.activateUser("user1")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("activates user and writes audit log", async () => {
    const service = await loadService();

    const result = await service.activateUser("user1", { id: "actor1" }, { ip: "127.0.0.1" });

    expect(result.passwordHash).toBeUndefined();
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isActive: true,
          tokenVersion: { increment: 1 },
        }),
      }),
    );
    expect(auditMock.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "USER_ACTIVATED",
      }),
    );
  });

  it("throws when updating role for missing user", async () => {
    const service = await loadService();

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.updateUserRole("missing", "role2")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("throws when role is missing", async () => {
    const service = await loadService();

    prismaMock.role.findUnique.mockResolvedValueOnce(null);

    await expect(service.updateUserRole("user1", "missing-role")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("updates user role", async () => {
    const service = await loadService();

    const result = await service.updateUserRole("user1", "role2");

    expect(result.passwordHash).toBeUndefined();
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          roleId: "role2",
          tokenVersion: { increment: 1 },
        }),
      }),
    );
    expect(auditMock.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "USER_ROLE_UPDATED",
      }),
    );
  });

  it("throws when updating department for missing user", async () => {
    const service = await loadService();

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.updateUserDepartment("missing", "dep1")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("throws when department is missing", async () => {
    const service = await loadService();

    prismaMock.department.findUnique.mockResolvedValueOnce(null);

    await expect(service.updateUserDepartment("user1", "missing-dep")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("updates user department to null without department lookup", async () => {
    const service = await loadService();

    await service.updateUserDepartment("user1", null);

    expect(prismaMock.department.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          departmentId: null,
          tokenVersion: { increment: 1 },
        }),
      }),
    );
  });

  it("deactivates user", async () => {
    const service = await loadService();

    const result = await service.deactivateUser("user1");

    expect(result.passwordHash).toBeUndefined();
    expect(auditMock.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "USER_DEACTIVATED",
      }),
    );
  });

  it("throws when deactivating missing user", async () => {
    const service = await loadService();

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.deactivateUser("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("force logs out user", async () => {
    const service = await loadService();

    const result = await service.forceLogoutUser("user1");

    expect(result.passwordHash).toBeUndefined();
    expect(auditMock.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "USER_FORCE_LOGOUT",
      }),
    );
  });

  it("throws when force logging out missing user", async () => {
    const service = await loadService();

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.forceLogoutUser("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("updates own profile with formatted names and default theme", async () => {
    const service = await loadService();

    const result = await service.updateProfile("user1", {
      firstName: "  mustafa   ali ",
      lastName: " topal ",
      phone: " 555 ",
    });

    expect(result.passwordHash).toBeUndefined();
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          firstName: "Mustafa Ali",
          lastName: "TOPAL",
          phone: "555",
          preferredTheme: "light",
        },
      }),
    );
  });

  it("throws when updating profile for missing user", async () => {
    const service = await loadService();

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.updateProfile("missing", {
        firstName: "Test",
        lastName: "User",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("throws when profile photo is missing", async () => {
    const service = await loadService();

    await expect(service.uploadProfilePhoto("user1", null)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("cleans local file when uploading profile photo for missing user", async () => {
    const service = await loadService();

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.uploadProfilePhoto("missing", {
        path: "/tmp/photo.png",
        originalname: "photo.png",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });

    expect(cleanupMock.cleanupLocalFile).toHaveBeenCalledWith("/tmp/photo.png");
  });

  it("uploads profile photo and adds download url", async () => {
    const service = await loadService();

    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...baseUser,
      profilePhotoUrl: "old/photo.png",
    });

    prismaMock.user.update.mockResolvedValueOnce({
      ...baseUser,
      profilePhotoUrl: "users/profile-photos/photo.png",
    });

    const result = await service.uploadProfilePhoto("user1", {
      path: "/tmp/photo.png",
      originalname: "photo.png",
    });

    expect(storageMock.ensureStorageFolder).toHaveBeenCalledWith("users", "profile-photos");
    expect(storageMock.uploadFile).toHaveBeenCalled();
    expect(storageMock.deleteFile).toHaveBeenCalledWith("old/photo.png");
    expect(cleanupMock.cleanupLocalFile).toHaveBeenCalledWith("/tmp/photo.png");
    expect(result.profilePhotoDownloadUrl).toBe("https://download.test/photo.png");
    expect(result.passwordHash).toBeUndefined();
  });

  it("returns null download url when storage download url fails", async () => {
    const service = await loadService();

    storageMock.getDownloadUrl.mockRejectedValueOnce(new Error("download failed"));

    prismaMock.user.update.mockResolvedValueOnce({
      ...baseUser,
      profilePhotoUrl: "users/profile-photos/photo.png",
    });

    const result = await service.uploadProfilePhoto("user1", {
      path: "/tmp/photo.png",
      originalname: "photo.png",
    });

    expect(result.profilePhotoDownloadUrl).toBeNull();
  });

  it("throws when removing profile photo for missing user", async () => {
    const service = await loadService();

    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.removeProfilePhoto("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("removes existing profile photo", async () => {
    const service = await loadService();

    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...baseUser,
      profilePhotoUrl: "old/photo.png",
    });

    const result = await service.removeProfilePhoto("user1");

    expect(storageMock.deleteFile).toHaveBeenCalledWith("old/photo.png");
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { profilePhotoUrl: null },
      }),
    );
    expect(result.passwordHash).toBeUndefined();
  });

  it("removes profile photo when no previous file exists", async () => {
    const service = await loadService();

    await service.removeProfilePhoto("user1");

    expect(storageMock.deleteFile).not.toHaveBeenCalled();
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { profilePhotoUrl: null },
      }),
    );
  });
});
