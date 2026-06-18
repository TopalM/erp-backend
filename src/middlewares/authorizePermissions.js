import { prisma } from "../database/prisma.client.js";
import { ROLES } from "../constants/roles.js";
import { AppError } from "../utils/appError.js";

// Kullanıcı SUPER_ADMIN mı kontrol eder.
export const isSuperAdmin = (req) => {
  return req.user?.role?.name === ROLES.SUPER_ADMIN;
};

// Kullanıcı sistem yöneticisi seviyesinde mi kontrol eder.
// SUPER_ADMIN ve ADMIN tüm permission kontrollerini bypass eder.
export const isAdminLike = (req) => {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user?.role?.name);
};

// Kullanıcının istenen permissionlara sahip olup olmadığını kontrol eder.
// SUPER_ADMIN ve ADMIN için permission kontrolü yapılmaz.
// Diğer kullanıcılar için requiredPermissions listesindeki tüm yetkiler aranır.
export const authorizePermissions = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Yetkisiz erişim.", 401);
      }

      if (isAdminLike(req)) {
        return next();
      }

      let userPermissions = req.user.userPermissions;

      if (!userPermissions) {
        userPermissions = await prisma.userPermission.findMany({
          where: {
            userId: req.user.id,
          },
          include: {
            permission: true,
          },
        });
      }

      const permissionSet = new Set();

      userPermissions.forEach((userPermission) => {
        if (userPermission.permission?.code) {
          permissionSet.add(userPermission.permission.code);
        }
      });

      const hasAllPermissions = requiredPermissions.every((permission) => permissionSet.has(permission));

      if (!hasAllPermissions) {
        throw new AppError("Bu işlem için yetkiniz bulunmamaktadır.", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Sadece SUPER_ADMIN rolüne izin verir.
// Sistem logları, audit logları, süper admin yönetimi gibi kritik işlemlerde kullanılır.
export const authorizeSuperAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Yetkisiz erişim.", 401);
    }

    if (!isSuperAdmin(req)) {
      throw new AppError("Bu işlem sadece Süper Admin tarafından yapılabilir.", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
