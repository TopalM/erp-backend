import crypto from "crypto";
import path from "path";

import { buildStoragePath, uploadFile, deleteFile, getDownloadUrl, ensureStorageFolder } from "../../platform/storage/storage.service.js";
import { cleanupLocalFile } from "../../platform/storage/storage.cleanup.js";

import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/appError.js";
import { sanitizeUser } from "../../../utils/sanitizeUser.js";
import { createAuditLog } from "../../platform/audit/audit-logs/audit-log.service.js";

const userInclude = {
  department: true,
  role: true,
  employee: {
    include: {
      department: true,
      location: true,
    },
  },
  userPermissions: {
    include: {
      permission: true,
    },
  },
};

const addProfilePhotoDownloadUrl = async (user) => {
  const safeUser = sanitizeUser(user);

  if (!safeUser?.profilePhotoUrl) {
    return safeUser;
  }

  try {
    safeUser.profilePhotoDownloadUrl = await getDownloadUrl(safeUser.profilePhotoUrl);
  } catch {
    safeUser.profilePhotoDownloadUrl = null;
  }

  return safeUser;
};

const formatName = (value) => {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toLocaleUpperCase("tr-TR"));
};

const formatSurname = (value) => {
  return value.trim().toLocaleUpperCase("tr-TR");
};

export const getUsers = async () => {
  const users = await prisma.user.findMany({
    include: userInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map(sanitizeUser);
};

export const getPendingUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      isActive: false,
    },
    include: userInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map(sanitizeUser);
};

export const activateUser = async (userId, actorUser = null, req = null) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  if (!existingUser.roleId) {
    throw new AppError("Kullanıcı aktif edilmeden önce rol atanmalıdır.", 400);
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isActive: true,
      tokenVersion: {
        increment: 1,
      },
    },
    include: userInclude,
  });

  await createAuditLog({
    actorUser,
    targetUser: user,
    entityType: "USER",
    entityId: user.id,
    action: "USER_ACTIVATED",
    message: `${user.email} kullanıcısı aktif edildi.`,
    oldValue: {
      isActive: existingUser.isActive,
    },
    newValue: {
      isActive: user.isActive,
    },
    req,
  });

  return sanitizeUser(user);
};

export const updateUserRole = async (userId, roleId, actorUser = null, req = null) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  const role = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
  });

  if (!role) {
    throw new AppError("Rol bulunamadı.", 404);
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      roleId,
      tokenVersion: {
        increment: 1,
      },
    },
    include: userInclude,
  });

  await createAuditLog({
    actorUser,
    targetUser: user,
    entityType: "USER",
    entityId: user.id,
    action: "USER_ROLE_UPDATED",
    message: `${user.email} kullanıcısının rolü güncellendi.`,
    oldValue: {
      roleId: existingUser.roleId,
    },
    newValue: {
      roleId: user.roleId,
      roleName: user.role?.name,
    },
    req,
  });

  return sanitizeUser(user);
};

export const updateUserDepartment = async (userId, departmentId, actor = null, req = null) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  if (departmentId !== null) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new AppError("Departman bulunamadı.", 404);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      departmentId,
      tokenVersion: {
        increment: 1,
      },
    },
    include: userInclude,
  });

  await createAuditLog({
    actor,
    action: "UPDATE",
    module: "AUTH",
    entityType: "USER",
    entityId: userId,
    message: "Kullanıcı departmanı güncellendi.",
    oldValue: { departmentId: existingUser.departmentId },
    newValue: { departmentId },
    req,
  });

  return sanitizeUser(updatedUser);
};

export const deactivateUser = async (userId, actorUser = null, req = null) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isActive: false,
      tokenVersion: {
        increment: 1,
      },
    },
    include: userInclude,
  });

  await createAuditLog({
    actorUser,
    targetUser: user,
    entityType: "USER",
    entityId: user.id,
    action: "USER_DEACTIVATED",
    message: `${user.email} kullanıcısı pasif edildi.`,
    oldValue: {
      isActive: existingUser.isActive,
    },
    newValue: {
      isActive: user.isActive,
    },
    req,
  });

  return sanitizeUser(user);
};

export const forceLogoutUser = async (userId, actorUser = null, req = null) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      tokenVersion: {
        increment: 1,
      },
    },
    include: userInclude,
  });

  await createAuditLog({
    actorUser,
    targetUser: user,
    entityType: "USER",
    entityId: user.id,
    action: "USER_FORCE_LOGOUT",
    message: `${user.email} kullanıcısının oturumu sonlandırıldı.`,
    oldValue: {
      tokenVersion: existingUser.tokenVersion,
    },
    newValue: {
      tokenVersion: user.tokenVersion,
    },
    req,
  });

  return sanitizeUser(user);
};

export const updateProfile = async (userId, data) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      firstName: formatName(data.firstName),
      lastName: formatSurname(data.lastName),
      phone: data.phone?.trim() || null,
      preferredTheme: data.preferredTheme || existingUser.preferredTheme || "light",
    },
    include: userInclude,
  });

  return sanitizeUser(user);
};

export const uploadProfilePhoto = async (userId, file) => {
  if (!file) {
    throw new AppError("Profil fotoğrafı zorunludur.", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    await cleanupLocalFile(file.path);
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  const extension = path.extname(file.originalname || "").toLowerCase();
  const storedFileName = `${userId}-${crypto.randomUUID()}${extension}`;

  await ensureStorageFolder("users", "profile-photos");

  const storagePath = buildStoragePath("users", "profile-photos", storedFileName);

  try {
    await uploadFile({
      localFilePath: file.path,
      storagePath,
      overwrite: true,
    });

    if (existingUser.profilePhotoUrl) {
      await deleteFile(existingUser.profilePhotoUrl);
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profilePhotoUrl: storagePath,
      },
      include: userInclude,
    });

    return addProfilePhotoDownloadUrl(user);
  } finally {
    await cleanupLocalFile(file.path);
  }
};

export const removeProfilePhoto = async (userId) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  if (existingUser.profilePhotoUrl) {
    await deleteFile(existingUser.profilePhotoUrl);
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profilePhotoUrl: null,
    },
    include: userInclude,
  });

  return sanitizeUser(user);
};
