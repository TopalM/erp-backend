import express from "express";

import { prisma } from "../../../../database/prisma.client.js";
import { authMiddleware } from "../../../../middlewares/auth.middleware.js";
import { authorizePermissions } from "../../../../middlewares/authorizePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";
import { asyncHandler } from "../../../../utils/asyncHandler.js";
import { successResponse } from "../../../../utils/apiResponse.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorizePermissions(PERMISSIONS.SYSTEM_LOG_READ),
  asyncHandler(async (req, res) => {
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

router.delete(
  "/",
  authMiddleware,
  authorizePermissions(PERMISSIONS.SYSTEM_LOG_DELETE),
  asyncHandler(async (req, res) => {
    const beforeDate = new Date();
    beforeDate.setDate(beforeDate.getDate() - 180);

    const result = await prisma.authEventLog.deleteMany({
      where: {
        createdAt: {
          lt: beforeDate,
        },
      },
    });

    return successResponse(
      res,
      {
        deletedCount: result.count,
        beforeDate,
      },
      "180 günden eski kimlik doğrulama logları temizlendi.",
    );
  }),
);

export default router;
