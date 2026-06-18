import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  createPeriodicMaintenanceController,
  deletePeriodicMaintenanceController,
  getAllPeriodicMaintenancesController,
  getAllPeriodicMaintenancesForFaultController,
  getPeriodicMaintenanceDownloadController,
  updatePeriodicMaintenanceController,
  updatePeriodicMaintenanceStatusController,
} from "./periodicMaintenance.controller.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "periodic-maintenances");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Sadece PDF dosyası yüklenebilir."));
      return;
    }

    cb(null, true);
  },
});

router.get("/all", getAllPeriodicMaintenancesController);
router.get("/allForAdmin", getAllPeriodicMaintenancesController);

router.get("/allForFaultMaintenance", getAllPeriodicMaintenancesForFaultController);
router.get("/allForFaultMaintenanceForAdmin", getAllPeriodicMaintenancesForFaultController);

router.post("/add", upload.single("file"), createPeriodicMaintenanceController);
router.post("/update", upload.single("file"), updatePeriodicMaintenanceController);

router.post("/delete", deletePeriodicMaintenanceController);
router.delete("/delete/:id", deletePeriodicMaintenanceController);

router.post("/status", updatePeriodicMaintenanceStatusController);
router.post("/updateStatus", updatePeriodicMaintenanceStatusController);

router.get("/getPeriodicMaintenanceDownload", getPeriodicMaintenanceDownloadController);

export default router;
