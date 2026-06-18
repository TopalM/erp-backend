import express from "express";

import { prisma } from "../../../../database/prisma.client.js";
import { authMiddleware } from "../../../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../../../middlewares/role.middleware.js";
import { ROLES } from "../../../../constants/roles.js";
import { asyncHandler } from "../../../../utils/asyncHandler.js";
import { successResponse } from "../../../../utils/apiResponse.js";

const router = express.Router();

// Audit log kayıtlarını listeler.
// Sadece SUPER_ADMIN rolüne sahip kullanıcılar erişebilir.
// Son 100 sistem işlem kaydını en yeniden en eskiye doğru getirir.
router.get(
  "/",
  authMiddleware,
  authorizeRoles(ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    res.set("Cache-Control", "no-store");

    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(res, logs, "Audit log kayıtları getirildi.");
  }),
);

// Audit log kayıtlarını temizler.
// Güvenlik için tüm kayıtları silmek yerine yalnızca 180 günden eski kayıtları siler.
// Sadece SUPER_ADMIN rolüne sahip kullanıcılar erişebilir.
router.delete(
  "/",
  authMiddleware,
  authorizeRoles(ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const result = await prisma.auditLog.deleteMany();

    return successResponse(
      res,
      {
        deletedCount: result.count,
      },
      "Audit log kayıtları temizlendi.",
    );
  }),
);

export default router;
