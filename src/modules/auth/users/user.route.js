import express from "express";

import * as userController from "./user.controller.js";

import { updateProfileSchema, updateUserRoleSchema, updateUserDepartmentSchema } from "./user.validation.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { authorizePermissions } from "../../../middlewares/authorizePermissions.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { uploadTempFiles } from "../../../middlewares/uploadTempFiles.middleware.js";

import { PERMISSIONS } from "../../../constants/permissions.js";

const router = express.Router();

router.patch("/profile", authMiddleware, validate(updateProfileSchema), userController.updateProfile);

router.post("/profile/photo", authMiddleware, uploadTempFiles.single("photo"), userController.uploadProfilePhoto);

router.delete("/profile/photo", authMiddleware, userController.removeProfilePhoto);

router.get("/", authMiddleware, authorizePermissions(PERMISSIONS.USER_READ), userController.getUsers);

router.get("/pending", authMiddleware, authorizePermissions(PERMISSIONS.USER_READ), userController.getPendingUsers);

router.patch("/:id/activate", authMiddleware, authorizePermissions(PERMISSIONS.USER_UPDATE), userController.activateUser);

router.patch("/:id/deactivate", authMiddleware, authorizePermissions(PERMISSIONS.USER_UPDATE), userController.deactivateUser);

router.patch(
  "/:id/role",
  authMiddleware,
  authorizePermissions(PERMISSIONS.USER_ROLE_MANAGE),
  validate(updateUserRoleSchema),
  userController.updateUserRole,
);

router.patch(
  "/:id/department",
  authMiddleware,
  authorizePermissions(PERMISSIONS.USER_UPDATE),
  validate(updateUserDepartmentSchema),
  userController.updateUserDepartment,
);

router.patch("/:id/force-logout", authMiddleware, authorizePermissions(PERMISSIONS.USER_UPDATE), userController.forceLogoutUser);

export default router;
