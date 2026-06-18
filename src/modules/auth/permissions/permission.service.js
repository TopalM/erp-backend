import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/appError.js";

// Yetki kodunu standart formata çevirir.
// Örn: " Supplier.Read " => "supplier.read"
const normalizePermissionCode = (code) => {
  return code.trim().toLowerCase();
};

// Tüm yetkileri listeler.
export const getPermissions = async () => {
  return prisma.permission.findMany({
    orderBy: {
      code: "asc",
    },
  });
};

// Tek bir yetki detayını getirir.
export const getPermissionById = async (id) => {
  const permission = await prisma.permission.findUnique({
    where: {
      id,
    },
  });

  if (!permission) {
    throw new AppError("Yetki bulunamadı.", 404);
  }

  return permission;
};

// Yeni yetki oluşturur.
export const createPermission = async (payload) => {
  const code = normalizePermissionCode(payload.code);

  const existingPermission = await prisma.permission.findUnique({
    where: {
      code,
    },
  });

  if (existingPermission) {
    throw new AppError("Bu yetki kodu zaten kullanılıyor.", 409);
  }

  return prisma.permission.create({
    data: {
      code,
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
    },
  });
};

// Yetki bilgisini günceller.
export const updatePermission = async (id, payload) => {
  const existingPermission = await prisma.permission.findUnique({
    where: {
      id,
    },
  });

  if (!existingPermission) {
    throw new AppError("Yetki bulunamadı.", 404);
  }

  const data = {};

  if (payload.code !== undefined) {
    const code = normalizePermissionCode(payload.code);

    const codeOwner = await prisma.permission.findUnique({
      where: {
        code,
      },
    });

    if (codeOwner && codeOwner.id !== id) {
      throw new AppError("Bu yetki kodu zaten kullanılıyor.", 409);
    }

    data.code = code;
  }

  if (payload.name !== undefined) {
    data.name = payload.name.trim();
  }

  if (payload.description !== undefined) {
    data.description = payload.description?.trim() || null;
  }

  return prisma.permission.update({
    where: {
      id,
    },
    data,
  });
};

// Yetkiyi siler.
// Eğer kullanıcıya atanmışsa silmeye izin vermez.
export const deletePermission = async (id) => {
  const existingPermission = await prisma.permission.findUnique({
    where: {
      id,
    },
    include: {
      userPermissions: {
        select: {
          id: true,
        },
        take: 1,
      },
    },
  });

  if (!existingPermission) {
    throw new AppError("Yetki bulunamadı.", 404);
  }

  if (existingPermission.userPermissions.length > 0) {
    throw new AppError("Kullanıcıya atanmış yetki silinemez.", 400);
  }

  return prisma.permission.delete({
    where: {
      id,
    },
  });
};

// Kullanıcının özel yetkilerini getirir.
export const getUserPermissions = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  return prisma.userPermission.findMany({
    where: {
      userId,
    },
    include: {
      permission: true,
    },
    orderBy: {
      permission: {
        code: "asc",
      },
    },
  });
};

// Kullanıcının özel yetkilerini tamamen yeniler.
// Önce mevcut özel yetkiler silinir, sonra yeni liste eklenir.
export const updateUserPermissions = async (userId, permissions) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  const permissionIds = permissions.map((item) => item.permissionId);

  if (permissionIds.length > 0) {
    const existingPermissions = await prisma.permission.findMany({
      where: {
        id: {
          in: permissionIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingPermissions.length !== permissionIds.length) {
      throw new AppError("Geçersiz yetki id bulundu.", 400);
    }
  }

  await prisma.userPermission.deleteMany({
    where: {
      userId,
    },
  });

  if (permissions.length > 0) {
    await prisma.userPermission.createMany({
      data: permissions.map((item) => ({
        userId,
        permissionId: item.permissionId,
        effect: item.effect,
      })),
    });
  }

  return prisma.userPermission.findMany({
    where: {
      userId,
    },
    include: {
      permission: true,
    },
    orderBy: {
      permission: {
        code: "asc",
      },
    },
  });
};
