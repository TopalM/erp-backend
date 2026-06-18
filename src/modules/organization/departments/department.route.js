import express from "express";

import * as departmentController from "./department.controller.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { authorizePermissions } from "../../../middlewares/authorizePermissions.js";
import { validate } from "../../../middlewares/validate.middleware.js";

import { PERMISSIONS } from "../../../constants/permissions.js";

import { createDepartmentSchema, updateDepartmentSchema } from "./department.validation.js";

const router = express.Router();

// Bu modüldeki tüm endpointler için kullanıcı girişi zorunludur.
router.use(authMiddleware);

// Departman listesini getirir.
// Departman okuma yetkisi gerekir.
router.get("/", authorizePermissions(PERMISSIONS.DEPARTMENT_READ), departmentController.listDepartments);

// Tek bir departmanın detayını getirir.
// Departman okuma yetkisi gerekir.
router.get("/:id", authorizePermissions(PERMISSIONS.DEPARTMENT_READ), departmentController.getDepartmentById);

// Yeni departman oluşturur.
// Departman oluşturma yetkisi gerekir.
router.post("/", authorizePermissions(PERMISSIONS.DEPARTMENT_CREATE), validate(createDepartmentSchema), departmentController.createDepartment);

// Departman günceller.
// Departman güncelleme yetkisi gerekir.
router.patch("/:id", authorizePermissions(PERMISSIONS.DEPARTMENT_UPDATE), validate(updateDepartmentSchema), departmentController.updateDepartment);

// Departman siler.
// Departman silme yetkisi gerekir.
router.delete("/:id", authorizePermissions(PERMISSIONS.DEPARTMENT_DELETE), departmentController.deleteDepartment);

export default router;
