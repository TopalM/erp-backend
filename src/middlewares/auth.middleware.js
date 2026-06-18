import jwt from "jsonwebtoken";

import { prisma } from "../database/prisma.client.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

// JWT token doğrulama middleware'i.
// Authorization header içindeki Bearer tokenı kontrol eder.
// Token geçerliyse kullanıcıyı veritabanından çeker ve req.user içine yazar.
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Yetkisiz erişim.", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.jwt.secret);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      include: {
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
      },
    });

    if (!user || !user.isActive) {
      throw new AppError("Yetkisiz erişim.", 401);
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new AppError("Oturum geçerliliğini yitirdi. Lütfen tekrar giriş yapın.", 401);
    }

    req.user = sanitizeUser(user);
    req.auth = decoded;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError("Geçersiz veya süresi dolmuş token.", 401));
    }

    next(error);
  }
};
