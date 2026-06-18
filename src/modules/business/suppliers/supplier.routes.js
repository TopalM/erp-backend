import express from "express";

import * as controller from "./supplier.controller.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { authorizePermissions } from "../../../middlewares/authorizePermissions.js";

import { PERMISSIONS } from "../../../constants/permissions.js";

import { createSupplierSchema, updateSupplierSchema } from "./supplier.validation.js";

const router = express.Router();

// Tüm tedarikçi endpointleri için giriş yapmış kullanıcı zorunludur.
router.use(authMiddleware);

// Tedarikçi listesini getirir.
// Purchasing ekranı şu şekilde kullanır:
// /api/suppliers?categoryTypes=MATERIAL,SERVICE
router.get("/", authorizePermissions(PERMISSIONS.SUPPLIER_READ), controller.listSuppliers);

// Eski client uyumluluğu için alternatif liste endpointi.
router.get("/all", authorizePermissions(PERMISSIONS.SUPPLIER_READ), controller.listSuppliers);

// Yeni tedarikçi oluşturur.
// categoryType gönderilirse o kategoriyle kayıt açılır.
// Gönderilmezse service tarafında MATERIAL varsayılır.
router.post("/", authorizePermissions(PERMISSIONS.SUPPLIER_CREATE), validate(createSupplierSchema), controller.createSupplier);

// Mevcut tedarikçiyi günceller.
router.patch("/:id", authorizePermissions(PERMISSIONS.SUPPLIER_UPDATE), validate(updateSupplierSchema), controller.updateSupplier);

// Tedarikçiyi soft delete ile siler.
router.delete("/:id", authorizePermissions(PERMISSIONS.SUPPLIER_DELETE), controller.deleteSupplier);

export default router;
