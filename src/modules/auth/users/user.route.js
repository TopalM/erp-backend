import express from "express";

import * as userController from "./user.controller.js";

import { updateProfileSchema, updateUserRoleSchema, updateUserDepartmentSchema } from "./user.validation.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../../middlewares/role.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { uploadTempFiles } from "../../../middlewares/uploadTempFiles.middleware.js";

import { ROLES } from "../../../constants/roles.js";

const router = express.Router();

const userManagerRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

// Önce sabit profile route'ları
router.patch("/profile", authMiddleware, validate(updateProfileSchema), userController.updateProfile);

router.post("/profile/photo", authMiddleware, uploadTempFiles.single("photo"), userController.uploadProfilePhoto);

router.delete("/profile/photo", authMiddleware, userController.removeProfilePhoto);

// Sonra kullanıcı yönetimi route'ları
router.get("/", authMiddleware, authorizeRoles(...userManagerRoles), userController.getUsers);

router.get("/pending", authMiddleware, authorizeRoles(...userManagerRoles), userController.getPendingUsers);

router.patch("/:id/activate", authMiddleware, authorizeRoles(...userManagerRoles), userController.activateUser);

router.patch("/:id/deactivate", authMiddleware, authorizeRoles(...userManagerRoles), userController.deactivateUser);

router.patch("/:id/role", authMiddleware, authorizeRoles(...userManagerRoles), validate(updateUserRoleSchema), userController.updateUserRole);

router.patch(
  "/:id/department",
  authMiddleware,
  authorizeRoles(...userManagerRoles),
  validate(updateUserDepartmentSchema),
  userController.updateUserDepartment,
);

router.patch("/:id/force-logout", authMiddleware, authorizeRoles(...userManagerRoles), userController.forceLogoutUser);

export default router;
