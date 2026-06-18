// src/middlewares/role.middleware.js

import { ROLES } from "../constants/roles.js";
import { AppError } from "../utils/appError.js";

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        throw new AppError("Yetkisiz erişim.", 401);
      }

      const userRole = typeof req.user.role === "string" ? req.user.role : req.user.role.name;

      // SUPER_ADMIN sadece allowedRoles içinde değilse bypass etsin.
      if (userRole === ROLES.SUPER_ADMIN) {
        return next();
      }

      // ADMIN artık her şeyi bypass etmesin.
      // Sadece route içinde izin verilen roller arasındaysa geçsin.
      if (!allowedRoles.includes(userRole)) {
        throw new AppError("Bu işlem için yetkiniz bulunmamaktadır.", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
