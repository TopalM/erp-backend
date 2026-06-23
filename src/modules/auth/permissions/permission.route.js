import express from "express";

import * as controller from "./permission.controller.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { authorizePermissions } from "../../../middlewares/authorizePermissions.js";
import { validate } from "../../../middlewares/validate.middleware.js";

import { PERMISSIONS } from "../../../constants/permissions.js";

import { createPermissionSchema, updatePermissionSchema, updateUserPermissionsSchema } from "./permission.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", authorizePermissions(PERMISSIONS.USER_PERMISSION_MANAGE), controller.getPermissions);

router.get("/user/:userId", authorizePermissions(PERMISSIONS.USER_PERMISSION_MANAGE), controller.getUserPermissions);

router.put(
  "/user/:userId",
  authorizePermissions(PERMISSIONS.USER_PERMISSION_MANAGE),
  validate(updateUserPermissionsSchema),
  controller.updateUserPermissions,
);

router.get("/:id", authorizePermissions(PERMISSIONS.USER_PERMISSION_MANAGE), controller.getPermissionById);

router.post("/", authorizePermissions(PERMISSIONS.USER_PERMISSION_MANAGE), validate(createPermissionSchema), controller.createPermission);

router.patch("/:id", authorizePermissions(PERMISSIONS.USER_PERMISSION_MANAGE), validate(updatePermissionSchema), controller.updatePermission);

router.delete("/:id", authorizePermissions(PERMISSIONS.USER_PERMISSION_MANAGE), controller.deletePermission);

export default router;
