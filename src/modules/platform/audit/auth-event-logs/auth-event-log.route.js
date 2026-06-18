import express from "express";

import { prisma } from "../../../../database/prisma.client.js";
import { authMiddleware } from "../../../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../../../middlewares/role.middleware.js";
import { ROLES } from "../../../../constants/roles.js";
import { asyncHandler } from "../../../../utils/asyncHandler.js";
import { successResponse } from "../../../../utils/apiResponse.js";

const router = express.Router();

// Auth event log kayıtlarını listeler.
// Sadece SUPER_ADMIN rolüne sahip kullanıcılar erişebilir.
// Son 100 kimlik doğrulama olayını en yeniden en eskiye doğru getirir.
router.get(
  "/",
  authMiddleware,
  authorizeRoles(ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    // Tarayıcı cache kullanmasın.
    res.set("Cache-Control", "no-store");

    const logs = await prisma.authEventLog.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return successResponse(res, logs, "Kimlik doğrulama logları getirildi.");
  }),
);

// Tüm auth event log kayıtlarını temizler.
// Sadece SUPER_ADMIN rolüne sahip kullanıcılar erişebilir.
router.delete(
  "/",
  authMiddleware,
  authorizeRoles(ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const result = await prisma.authEventLog.deleteMany();

    return successResponse(
      res,
      {
        deletedCount: result.count,
      },
      "Kimlik doğrulama logları temizlendi.",
    );
  }),
);

export default router;
