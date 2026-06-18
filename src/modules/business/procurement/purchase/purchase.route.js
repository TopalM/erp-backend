import express from "express";

import * as purchaseController from "./purchase.controller.js";

import { authMiddleware } from "../../../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../../../middlewares/role.middleware.js";
import { validate } from "../../../../middlewares/validate.middleware.js";

import { createPurchaseSchema, updatePurchaseSchema } from "./purchase.validation.js";

import { ROLES } from "../../../../constants/roles.js";

const router = express.Router();

const purchaseManagerRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

router.get("/", authMiddleware, authorizeRoles(...purchaseManagerRoles), purchaseController.listPurchases);

router.get("/:id", authMiddleware, authorizeRoles(...purchaseManagerRoles), purchaseController.getPurchaseById);

router.post("/", authMiddleware, authorizeRoles(...purchaseManagerRoles), validate(createPurchaseSchema), purchaseController.createPurchase);

router.patch("/:id", authMiddleware, authorizeRoles(...purchaseManagerRoles), validate(updatePurchaseSchema), purchaseController.updatePurchase);

router.delete("/:id", authMiddleware, authorizeRoles(...purchaseManagerRoles), purchaseController.deletePurchase);

export default router;
