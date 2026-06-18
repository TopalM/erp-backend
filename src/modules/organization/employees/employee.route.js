import express from "express";

import * as controller from "./employee.controller.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { authorizePermissions } from "../../../middlewares/authorizePermissions.js";

import { PERMISSIONS } from "../../../constants/permissions.js";

import { createEmployeeSchema, updateEmployeeSchema, updateEmployeeStatusSchema, linkEmployeeUserSchema } from "./employee.validation.js";

const router = express.Router();

// Tüm çalışan endpointleri için giriş yapmış kullanıcı zorunludur.
router.use(authMiddleware);

// Çalışan listesini getirir.
// Çalışan okuma yetkisi gerekir.
// Query ile search, status, type ve departmentId filtreleri desteklenir.
router.get("/", authorizePermissions(PERMISSIONS.EMPLOYEE_READ), controller.getEmployees);

// Tek çalışan detayını getirir.
// Çalışan okuma yetkisi gerekir.
router.get("/:id", authorizePermissions(PERMISSIONS.EMPLOYEE_READ), controller.getEmployeeById);

// Yeni çalışan oluşturur.
// Çalışan oluşturma yetkisi gerekir.
router.post("/", authorizePermissions(PERMISSIONS.EMPLOYEE_CREATE), validate(createEmployeeSchema), controller.createEmployee);

// Mevcut çalışan bilgilerini günceller.
// Çalışan güncelleme yetkisi gerekir.
router.patch("/:id", authorizePermissions(PERMISSIONS.EMPLOYEE_UPDATE), validate(updateEmployeeSchema), controller.updateEmployee);

// Çalışan durumunu günceller.
// ACTIVE, PASSIVE, RESIGNED veya TERMINATED durumları için kullanılır.
// Çalışan güncelleme yetkisi gerekir.
router.patch("/:id/status", authorizePermissions(PERMISSIONS.EMPLOYEE_UPDATE), validate(updateEmployeeStatusSchema), controller.updateEmployeeStatus);

// Çalışanı bir kullanıcı hesabına bağlar.
// Beyaz yaka/ofis çalışanı ile sistem kullanıcısı arasında ilişki kurmak için kullanılır.
// Çalışan güncelleme yetkisi gerekir.
router.patch("/:id/link-user", authorizePermissions(PERMISSIONS.EMPLOYEE_UPDATE), validate(linkEmployeeUserSchema), controller.linkEmployeeUser);

// Çalışan ile kullanıcı hesabı bağlantısını kaldırır.
// Çalışan güncelleme yetkisi gerekir.
router.patch("/:id/unlink-user", authorizePermissions(PERMISSIONS.EMPLOYEE_UPDATE), controller.unlinkEmployeeUser);

// Çalışan kaydını siler.
// Çalışan silme yetkisi gerekir.
router.delete("/:id", authorizePermissions(PERMISSIONS.EMPLOYEE_DELETE), controller.deleteEmployee);

export default router;
