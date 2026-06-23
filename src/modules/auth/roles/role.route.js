import express from "express";

import * as roleController from "./role.controller.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { authorizePermissions } from "../../../middlewares/authorizePermissions.js";
import { validate } from "../../../middlewares/validate.middleware.js";

import { PERMISSIONS } from "../../../constants/permissions.js";

import { createRoleSchema, updateRoleSchema } from "./role.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", authorizePermissions(PERMISSIONS.USER_ROLE_MANAGE), roleController.listRoles);

router.get("/:id", authorizePermissions(PERMISSIONS.USER_ROLE_MANAGE), roleController.getRoleById);

router.post("/", authorizePermissions(PERMISSIONS.USER_ROLE_MANAGE), validate(createRoleSchema), roleController.createRole);

router.patch("/:id", authorizePermissions(PERMISSIONS.USER_ROLE_MANAGE), validate(updateRoleSchema), roleController.updateRole);

router.delete("/:id", authorizePermissions(PERMISSIONS.USER_ROLE_MANAGE), roleController.deleteRole);

export default router;
