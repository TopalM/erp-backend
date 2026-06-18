import express from "express";

import * as controller from "./production.controller.js";

import {
  addBatchSchema,
  cancelProductionSchema,
  createOriginSchema,
  createPlanSchema,
  delaySchema,
  finishProductionSchema,
  updatePlanSchema,
} from "./production.validation.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { authorizePermissions } from "../../../middlewares/authorizePermissions.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/week", authorizePermissions(PERMISSIONS.PRODUCTION_READ), controller.listWeek);

router.post(
  "/raw-material-origins",
  authorizePermissions(PERMISSIONS.PRODUCTION_CREATE),
  validate(createOriginSchema),
  controller.createRawMaterialOrigin,
);

router.post("/plans", authorizePermissions(PERMISSIONS.PRODUCTION_CREATE), validate(createPlanSchema), controller.createPlan);

router.patch("/plans/:id", authorizePermissions(PERMISSIONS.PRODUCTION_UPDATE), validate(updatePlanSchema), controller.updatePlan);

router.patch("/:id/finish", authorizePermissions(PERMISSIONS.PRODUCTION_UPDATE), validate(finishProductionSchema), controller.finishProduction);

router.patch("/:id/cancel", authorizePermissions(PERMISSIONS.PRODUCTION_UPDATE), validate(cancelProductionSchema), controller.cancelProduction);

router.post("/delays", authorizePermissions(PERMISSIONS.PRODUCTION_CREATE), validate(delaySchema), controller.saveDelay);

router.post("/batches", authorizePermissions(PERMISSIONS.PRODUCTION_CREATE), validate(addBatchSchema), controller.addBatch);

router.delete("/:id", authorizePermissions(PERMISSIONS.PRODUCTION_DELETE), controller.deleteJob);

export default router;
