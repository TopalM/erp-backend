import express from "express";

import {
  createFaultMaintenanceController,
  deleteFaultMaintenanceController,
  getAllFaultMaintenancesController,
  requestFaultMaintenanceController,
  updateFaultMaintenanceController,
  updateFaultMaintenanceStatusController,
} from "./faultMaintenance.controller.js";

const router = express.Router();

router.get("/all", getAllFaultMaintenancesController);
router.get("/allForAdmin", getAllFaultMaintenancesController);

router.post("/add", createFaultMaintenanceController);
router.post("/update", updateFaultMaintenanceController);

router.post("/delete", deleteFaultMaintenanceController);
router.delete("/delete/:id", deleteFaultMaintenanceController);

router.post("/submitRequest/:id", requestFaultMaintenanceController);
router.post("/submitRequest", requestFaultMaintenanceController);

router.post("/status", updateFaultMaintenanceStatusController);
router.post("/updateStatus", updateFaultMaintenanceStatusController);

export default router;
