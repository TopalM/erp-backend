import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/appError.js";

// Sistemin temel rolleri.
// Bu roller silinemez ve adı değiştirilemez.
const SYSTEM_ROLES = ["ADMIN", "VIEWER"];

// Rol adını standart formata çevirir.
// Örn: "satın alma müdürü" => "SATIN_ALMA_MUDURU"
const normalizeRoleName = (name) => {
  return name.trim().toUpperCase().replace(/\s+/g, "_");
};

// Tüm rolleri alfabetik olarak listeler.
export const listRolesService = async () => {
  return prisma.role.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

// Tek bir rol detayını getirir.
export const getRoleByIdService = async (id) => {
  const role = await prisma.role.findUnique({
    where: {
      id,
    },
  });

  if (!role) {
    throw new AppError("Rol bulunamadı.", 404);
  }

  return role;
};

// Yeni rol oluşturur.
// Aynı name değerine sahip rol varsa 409 döner.
export const createRoleService = async (payload) => {
  const name = normalizeRoleName(payload.name);

  const existingRole = await prisma.role.findUnique({
    where: {
      name,
    },
  });

  if (existingRole) {
    throw new AppError("Bu rol adı zaten kullanılıyor.", 409);
  }

  return prisma.role.create({
    data: {
      name,
    },
  });
};

// Rolü günceller.
// Sistem rolleri korunur.
export const updateRoleService = async (id, payload) => {
  const existingRole = await prisma.role.findUnique({
    where: {
      id,
    },
  });

  if (!existingRole) {
    throw new AppError("Rol bulunamadı.", 404);
  }

  if (SYSTEM_ROLES.includes(existingRole.name)) {
    throw new AppError("Sistem rolleri güncellenemez.", 400);
  }

  const data = {};

  if (payload.name !== undefined) {
    const name = normalizeRoleName(payload.name);

    const nameOwner = await prisma.role.findUnique({
      where: {
        name,
      },
    });

    if (nameOwner && nameOwner.id !== id) {
      throw new AppError("Bu rol adı zaten kullanılıyor.", 409);
    }

    data.name = name;
  }

  return prisma.role.update({
    where: {
      id,
    },
    data,
  });
};

// Rolü siler.
// Sistem rolleri silinemez.
// Role bağlı kullanıcı varsa Prisma ilişki hatası verebilir.
export const deleteRoleService = async (id) => {
  const existingRole = await prisma.role.findUnique({
    where: {
      id,
    },
  });

  if (!existingRole) {
    throw new AppError("Rol bulunamadı.", 404);
  }

  if (SYSTEM_ROLES.includes(existingRole.name)) {
    throw new AppError("Sistem rolleri silinemez.", 400);
  }

  return prisma.role.delete({
    where: {
      id,
    },
  });
};
