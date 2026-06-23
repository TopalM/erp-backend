import express from "express";

import * as controller from "./approval.controller.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { authorizePermissions } from "../../../middlewares/authorizePermissions.js";
import { validate } from "../../../middlewares/validate.middleware.js";

import { PERMISSIONS } from "../../../constants/permissions.js";

import { submitApprovalSchema, decideApprovalSchema } from "./approval.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", authorizePermissions(PERMISSIONS.APPROVAL_READ), controller.listApprovals);

router.post("/submit", authorizePermissions(PERMISSIONS.APPROVAL_CREATE), validate(submitApprovalSchema), controller.submitApproval);

router.patch("/:id/approve", authorizePermissions(PERMISSIONS.APPROVAL_DECIDE), validate(decideApprovalSchema), controller.approveApproval);

router.patch("/:id/reject", authorizePermissions(PERMISSIONS.APPROVAL_DECIDE), validate(decideApprovalSchema), controller.rejectApproval);

router.patch("/:id/cancel", authorizePermissions(PERMISSIONS.APPROVAL_CANCEL), controller.cancelApproval);

export default router;
