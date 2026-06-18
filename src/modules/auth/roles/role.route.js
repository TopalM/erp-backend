import express from "express";

import * as roleController from "./role.controller.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../../middlewares/role.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";

import { ROLES } from "../../../constants/roles.js";

import { createRoleSchema, updateRoleSchema } from "./role.validation.js";

const router = express.Router();

// Bu modüldeki tüm endpointler için giriş zorunludur.
router.use(authMiddleware);

// Rol listesini getirir.
// Sadece ADMIN erişebilir.
router.get("/", authorizeRoles(ROLES.ADMIN), roleController.listRoles);

// Tek rol detayını getirir.
// id kontrolü servis katmanında yapılır.
router.get("/:id", authorizeRoles(ROLES.ADMIN), roleController.getRoleById);

// Yeni rol oluşturur.
router.post("/", authorizeRoles(ROLES.ADMIN), validate(createRoleSchema), roleController.createRole);

// Rol adını günceller.
// ADMIN ve VIEWER gibi sistem rolleri servis katmanında korunur.
router.patch("/:id", authorizeRoles(ROLES.ADMIN), validate(updateRoleSchema), roleController.updateRole);

// Rol siler.
// ADMIN ve VIEWER gibi sistem rolleri servis katmanında silinemez.
router.delete("/:id", authorizeRoles(ROLES.ADMIN), roleController.deleteRole);

export default router;
