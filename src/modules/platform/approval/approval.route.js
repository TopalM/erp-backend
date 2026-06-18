import express from "express";

import * as controller from "./approval.controller.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { submitApprovalSchema, decideApprovalSchema } from "./approval.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", controller.listApprovals);
router.post("/submit", validate(submitApprovalSchema), controller.submitApproval);
router.patch("/:id/approve", validate(decideApprovalSchema), controller.approveApproval);
router.patch("/:id/reject", validate(decideApprovalSchema), controller.rejectApproval);
router.patch("/:id/cancel", controller.cancelApproval);

export default router;
