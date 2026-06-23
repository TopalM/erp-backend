import express from "express";
import os from "os";

import { prisma } from "../../database/prisma.client.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizePermissions } from "../../middlewares/authorizePermissions.js";
import { PERMISSIONS } from "../../constants/permissions.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import { env } from "../../config/env.js";

const router = express.Router();

router.get(
  "/health",
  authMiddleware,
  authorizePermissions(PERMISSIONS.SYSTEM_HEALTH_READ),
  asyncHandler(async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;

    const uptimeSeconds = Math.floor(process.uptime());

    return successResponse(
      res,
      {
        backend: "online",
        database: "connected",
        nodeEnv: env.nodeEnv,
        uptimeSeconds,
        uptimeText: `${Math.floor(uptimeSeconds / 3600)}s ${Math.floor((uptimeSeconds % 3600) / 60)}dk`,
        serverTime: new Date().toISOString(),
        platform: os.platform(),
        memory: {
          totalMb: Math.round(os.totalmem() / 1024 / 1024),
          freeMb: Math.round(os.freemem() / 1024 / 1024),
        },
      },
      "System health fetched.",
    );
  }),
);

export default router;
