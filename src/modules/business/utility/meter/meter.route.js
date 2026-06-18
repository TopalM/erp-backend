import express from "express";

import * as controller from "./meter.controller.js";
import { authMiddleware } from "../../../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", controller.listMeters);
router.get("/:id", controller.getMeterById);

export default router;
