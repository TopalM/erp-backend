import express from "express";

import authRoutes from "../modules/auth/auth/auth.route.js";
import userRoutes from "../modules/auth/users/user.route.js";
import roleRoutes from "../modules/auth/roles/role.route.js";
import permissionRoutes from "../modules/auth/permissions/permission.route.js";

import systemRoutes from "../modules/system/system.route.js";
import lookupRoutes from "../modules/lookups/lookup.route.js";

import auditLogRoutes from "../modules/platform/audit/audit-logs/audit-log.route.js";
import authEventLogRoutes from "../modules/platform/audit/auth-event-logs/auth-event-log.route.js";
import documentRoutes from "../modules/platform/document/document.route.js";
import approvalRoutes from "../modules/platform/approval/approval.route.js";
import assignmentRoutes from "../modules/platform/assignment/assignment.route.js";

import departmentRoutes from "../modules/organization/departments/department.route.js";
import employeeRoutes from "../modules/organization/employees/employee.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);

router.use("/system", systemRoutes);
router.use("/lookups", lookupRoutes);

router.use("/audit-logs", auditLogRoutes);
router.use("/auth-event-logs", authEventLogRoutes);
router.use("/documents", documentRoutes);
router.use("/approvals", approvalRoutes);
router.use("/assignments", assignmentRoutes);

router.use("/departments", departmentRoutes);
router.use("/employees", employeeRoutes);

export default router;
