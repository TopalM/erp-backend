import { prisma } from "../database/prisma.client.js";
import { ROLES } from "../constants/roles.js";
import { AppError } from "../utils/appError.js";

export const isSuperAdmin = (req) => {
  return req.user?.role?.name === ROLES.SUPER_ADMIN;
};

export const authorizePermissions = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Yetkisiz erişim.", 401);
      }

      if (isSuperAdmin(req)) {
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

      const allowedPermissions = new Set();
      const deniedPermissions = new Set();

      userPermissions.forEach((userPermission) => {
        const code = userPermission.permission?.code;

        if (!code) return;

        if (userPermission.effect === "DENY") {
          deniedPermissions.add(code);
          return;
        }

        allowedPermissions.add(code);
      });

      const hasDeniedPermission = requiredPermissions.some((permission) => deniedPermissions.has(permission));

      if (hasDeniedPermission) {
        throw new AppError("Bu işlem için yetkiniz bulunmamaktadır.", 403);
      }

      const hasAllPermissions = requiredPermissions.every((permission) => allowedPermissions.has(permission));

      if (!hasAllPermissions) {
        throw new AppError("Bu işlem için yetkiniz bulunmamaktadır.", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

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
