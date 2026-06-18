import express from "express";

import authRoutes from "../modules/auth/auth/auth.route.js";
import userRoutes from "../modules/auth/users/user.route.js";
import roleRoutes from "../modules/auth/roles/role.route.js";

import systemRoutes from "../modules/system/system.route.js";
import lookupRoutes from "../modules/lookups/lookup.route.js";
import auditLogRoutes from "../modules/platform/audit/audit-logs/audit-log.route.js";
import departmentRoutes from "../modules/organization/departments/department.route.js";
import permissionRoutes from "../modules/auth/permissions/permission.route.js";
import authEventLogRoutes from "../modules/platform/audit/auth-event-logs/auth-event-log.route.js";

import utilityMeterRoutes from "../modules/business/utility/meter/meter.route.js";
import utilityReadingRoutes from "../modules/business/utility/reading/reading.route.js";
import documentRoutes from "../modules/platform/document/document.route.js";
import approvalRoutes from "../modules/platform/approval/approval.route.js";
import assignmentRoutes from "../modules/platform/assignment/assignment.route.js";

import supplierRoutes from "../modules/business/suppliers/supplier.routes.js";
import employeeRoutes from "../modules/organization/employees/employee.route.js";

import personelRoutes from "../modules/business/maintenance/personel/personel.routes.js";
import vacationRoutes from "../modules/business/maintenance/personel/vacation.routes.js";
import tradeMarkRoutes from "../modules/business/maintenance/tradeMark/tradeMark.routes.js";
import mainMachineRoutes from "../modules/business/maintenance/mainMachine/mainMachine.routes.js";
import subMachineRoutes from "../modules/business/maintenance/subMachine/subMachine.routes.js";
import faultMaintenanceRoutes from "../modules/business/maintenance/faultMaintenance/faultMaintenance.routes.js";
import periodicMaintenanceRoutes from "../modules/business/maintenance/periodicMaintenance/periodicMaintenance.routes.js";
import endexRoutes from "../modules/business/maintenance/endex/endex.routes.js";

import rawMaterialPurchaseRoutes from "../modules/business/procurement/rawMaterial/rawMaterialPurchase.route.js";

import productionRoutes from "../modules/business/production/production.route.js";
import purchaseRoute from "../modules/business/procurement/purchase/purchase.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/system", systemRoutes);
router.use("/lookups", lookupRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/utility/meters", utilityMeterRoutes);
router.use("/utility/readings", utilityReadingRoutes);

router.use("/documents", documentRoutes);
router.use("/approvals", approvalRoutes);
router.use("/assignments", assignmentRoutes);

router.use("/departments", departmentRoutes);
router.use("/permissions", permissionRoutes);
router.use("/auth-event-logs", authEventLogRoutes);

router.use("/suppliers", supplierRoutes);
router.use("/employees", employeeRoutes);
router.use("/purchases", purchaseRoute);

router.use("/tradeMarks", tradeMarkRoutes);
router.use("/mainMachines", mainMachineRoutes);
router.use("/subMachines", subMachineRoutes);
router.use("/faultMaintenances", faultMaintenanceRoutes);
router.use("/periodicMaintenances", periodicMaintenanceRoutes);
router.use("/personels", personelRoutes);
router.use("/vacations", vacationRoutes);
router.use("/endex", endexRoutes);

router.use("/raw-material-purchase", rawMaterialPurchaseRoutes);

router.use("/productions", productionRoutes);

export default router;
