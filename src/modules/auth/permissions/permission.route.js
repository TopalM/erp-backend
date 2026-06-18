import express from "express";

import * as controller from "./permission.controller.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../../middlewares/role.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";

import { ROLES } from "../../../constants/roles.js";

import { createPermissionSchema, updatePermissionSchema, updateUserPermissionsSchema } from "./permission.validation.js";

const router = express.Router();

// Bu modüldeki tüm endpointler için giriş zorunludur.
router.use(authMiddleware);

// Yetki listesini getirir.
// Sadece ADMIN erişebilir.
router.get("/", authorizeRoles(ROLES.ADMIN), controller.getPermissions);

// Kullanıcının özel yetkilerini getirir.
// Bu route, /:id route'undan önce tanımlanmalıdır.
router.get("/user/:userId", authorizeRoles(ROLES.ADMIN), controller.getUserPermissions);

// Kullanıcının özel yetkilerini günceller.
// Body içindeki permissions array'i kullanıcının özel yetki listesinin yeni halidir.
router.put("/user/:userId", authorizeRoles(ROLES.ADMIN), validate(updateUserPermissionsSchema), controller.updateUserPermissions);

// Tek yetki detayını getirir.
router.get("/:id", authorizeRoles(ROLES.ADMIN), controller.getPermissionById);

// Yeni yetki oluşturur.
router.post("/", authorizeRoles(ROLES.ADMIN), validate(createPermissionSchema), controller.createPermission);

// Yetki bilgisini günceller.
router.patch("/:id", authorizeRoles(ROLES.ADMIN), validate(updatePermissionSchema), controller.updatePermission);

// Yetkiyi siler.
// Kullanıcıya atanmış yetkiler servis katmanında korunur.
router.delete("/:id", authorizeRoles(ROLES.ADMIN), controller.deletePermission);

export default router;
