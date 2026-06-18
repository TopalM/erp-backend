import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/appError.js";

// Departman kodunu standart formata çevirir.
// Örn: "insan kaynakları" => "INSAN_KAYNAKLARI"
const normalizeCode = (code) => {
  return code.trim().toUpperCase().replace(/\s+/g, "_");
};

// Tüm departmanları alfabetik olarak listeler.
export const listDepartmentsService = async () => {
  return prisma.department.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

// Tek bir departman detayını getirir.
export const getDepartmentByIdService = async (id) => {
  const department = await prisma.department.findUnique({
    where: {
      id,
    },
  });

  if (!department) {
    throw new AppError("Departman bulunamadı.", 404);
  }

  return department;
};

// Yeni departman oluşturur.
// Aynı code değerine sahip departman varsa 409 döner.
export const createDepartmentService = async (payload) => {
  const code = normalizeCode(payload.code);

  const existingDepartment = await prisma.department.findUnique({
    where: {
      code,
    },
  });

  if (existingDepartment) {
    throw new AppError("Bu departman kodu zaten kullanılıyor.", 409);
  }

  return prisma.department.create({
    data: {
      name: payload.name.trim(),
      code,
    },
  });
};

// Departman bilgisini günceller.
// Code değişiyorsa benzersizlik kontrolü yapılır.
export const updateDepartmentService = async (id, payload) => {
  const existingDepartment = await prisma.department.findUnique({
    where: {
      id,
    },
  });

  if (!existingDepartment) {
    throw new AppError("Departman bulunamadı.", 404);
  }

  const data = {};

  if (payload.name !== undefined) {
    data.name = payload.name.trim();
  }

  if (payload.code !== undefined) {
    const code = normalizeCode(payload.code);

    const codeOwner = await prisma.department.findUnique({
      where: {
        code,
      },
    });

    if (codeOwner && codeOwner.id !== id) {
      throw new AppError("Bu departman kodu zaten kullanılıyor.", 409);
    }

    data.code = code;
  }

  return prisma.department.update({
    where: {
      id,
    },
    data,
  });
};

// Departmanı siler.
// Eğer departmana bağlı kullanıcı varsa Prisma foreign key hatası verebilir.
// Bu durumda kullanıcıları başka departmana taşımak gerekir.
export const deleteDepartmentService = async (id) => {
  const existingDepartment = await prisma.department.findUnique({
    where: {
      id,
    },
  });

  if (!existingDepartment) {
    throw new AppError("Departman bulunamadı.", 404);
  }

  return prisma.department.delete({
    where: {
      id,
    },
  });
};
