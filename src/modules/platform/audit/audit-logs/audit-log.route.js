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
  authorizePermissions(PERMISSIONS.AUDIT_LOG_READ),
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

router.delete(
  "/",
  authMiddleware,
  authorizePermissions(PERMISSIONS.AUDIT_LOG_DELETE),
  asyncHandler(async (req, res) => {
    const beforeDate = new Date();
    beforeDate.setDate(beforeDate.getDate() - 180);

    const result = await prisma.auditLog.deleteMany({
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
      "180 günden eski audit log kayıtları temizlendi.",
    );
  }),
);

export default router;
