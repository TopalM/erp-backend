import express from "express";

import * as controller from "./assignment.controller.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { authorizePermissions } from "../../../middlewares/authorizePermissions.js";
import { validate } from "../../../middlewares/validate.middleware.js";

import { PERMISSIONS } from "../../../constants/permissions.js";

import { createAssignmentSchema, updateAssignmentSchema } from "./assignment.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", authorizePermissions(PERMISSIONS.ASSIGNMENT_READ), controller.listAssignments);

router.post("/", authorizePermissions(PERMISSIONS.ASSIGNMENT_CREATE), validate(createAssignmentSchema), controller.createAssignment);

router.patch("/:id", authorizePermissions(PERMISSIONS.ASSIGNMENT_UPDATE), validate(updateAssignmentSchema), controller.updateAssignment);

router.delete("/:id", authorizePermissions(PERMISSIONS.ASSIGNMENT_DELETE), controller.deleteAssignment);

export default router;
