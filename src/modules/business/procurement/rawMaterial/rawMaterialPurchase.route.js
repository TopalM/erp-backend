import express from "express";

import * as controller from "./rawMaterialPurchase.controller.js";

import {
  createPriceRecordSchema,
  createPriceRequestSchema,
  createPurchaseOrderSchema,
  createReceiptSchema,
  updatePriceRecordSchema,
  updatePurchaseOrderSchema,
  updatePurchaseSettingsSchema,
  sendSupplierPriceRequestMailSchema,
  respondPublicPriceRequestSchema,
} from "./rawMaterialPurchase.validation.js";

import { uploadTempFiles } from "../../../../config/multer.js";
import { authMiddleware } from "../../../../middlewares/auth.middleware.js";
import { authorizePermissions } from "../../../../middlewares/authorizePermissions.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                              Public Price Offer                            */
/* -------------------------------------------------------------------------- */

router.get("/public/price-requests/:token", controller.getPublicPriceRequest);

router.post("/public/price-requests/:token/respond", validate(respondPublicPriceRequestSchema), controller.respondPublicPriceRequest);

router.use(authMiddleware);

/* -------------------------------------------------------------------------- */
/*                                   Dashboard                                */
/* -------------------------------------------------------------------------- */

router.get("/dashboard", authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_READ), controller.getDashboard);

/* -------------------------------------------------------------------------- */
/*                                  Suppliers                                 */
/* -------------------------------------------------------------------------- */

router.get("/suppliers", authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_READ), controller.listRawMaterialSuppliers);

/* -------------------------------------------------------------------------- */
/*                                Price Records                               */
/* -------------------------------------------------------------------------- */

router.get("/price-records", authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_READ), controller.listPriceRecords);

router.get("/price-records/latest", authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_READ), controller.getLatestPriceRecords);

router.get("/price-records/:id", authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_READ), controller.getPriceRecordById);

router.post(
  "/price-records",
  authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_CREATE),
  validate(createPriceRecordSchema),
  controller.createPriceRecord,
);

router.patch(
  "/price-records/:id",
  authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_UPDATE),
  validate(updatePriceRecordSchema),
  controller.updatePriceRecord,
);

router.delete("/price-records/:id", authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_DELETE), controller.deletePriceRecord);

/* -------------------------------------------------------------------------- */
/*                                Price Requests                              */
/* -------------------------------------------------------------------------- */

router.post(
  "/price-requests",
  authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_CREATE),
  validate(createPriceRequestSchema),
  controller.createPriceRequest,
);

router.post(
  "/price-requests/send-mail",
  authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_CREATE),
  validate(sendSupplierPriceRequestMailSchema),
  controller.sendSupplierPriceRequestMail,
);

/* -------------------------------------------------------------------------- */
/*                               Purchase Orders                              */
/* -------------------------------------------------------------------------- */

router.get("/purchase-orders", authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_READ), controller.listPurchaseOrders);

router.post(
  "/purchase-orders",
  authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_CREATE),
  uploadTempFiles.array("files", 10),
  validate(createPurchaseOrderSchema),
  controller.createPurchaseOrder,
);

router.patch(
  "/purchase-orders/:id",
  authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_UPDATE),
  validate(updatePurchaseOrderSchema),
  controller.updatePurchaseOrder,
);

router.patch(
  "/purchase-orders/:id/send-to-import",
  authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_UPDATE),
  controller.sendPurchaseOrderToImport,
);

/* -------------------------------------------------------------------------- */
/*                                   Receipts                                 */
/* -------------------------------------------------------------------------- */

router.post("/receipts", authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_CREATE), validate(createReceiptSchema), controller.createReceipt);

/* -------------------------------------------------------------------------- */
/*                                   Settings                                 */
/* -------------------------------------------------------------------------- */

router.get("/settings", authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_SETTINGS_READ), controller.getPurchaseSettings);

router.put(
  "/settings",
  authorizePermissions(PERMISSIONS.RAW_MATERIAL_PURCHASE_SETTINGS_UPDATE),
  validate(updatePurchaseSettingsSchema),
  controller.updatePurchaseSettings,
);

export default router;
