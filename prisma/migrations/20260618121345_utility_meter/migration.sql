/*
  Warnings:

  - You are about to drop the column `fileName` on the `SupplierDocument` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `SupplierDocument` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `SupplierDocument` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `equipments` table. All the data in the column will be lost.
  - You are about to drop the column `machineType` on the `equipments` table. All the data in the column will be lost.
  - You are about to drop the `endexes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `equipment_locations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fault_maintenances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `periodic_maintenances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `personels` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `SupplierDocument` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('FAULT', 'PERIODIC');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalModule" AS ENUM ('PURCHASING', 'SUPPLIER', 'QUALITY', 'PRODUCTION', 'SHIPMENT', 'MAINTENANCE', 'SALES', 'IMPORT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ApprovalEntityType" AS ENUM ('PURCHASE_REQUEST', 'PURCHASE_ORDER', 'PURCHASE_INVOICE', 'SUPPLIER', 'SUPPLIER_DOCUMENT', 'QUALITY_INSPECTION', 'QUALITY_DEVIATION', 'MAINTENANCE_REQUEST', 'SALES_ORDER', 'SALES_DISCOUNT', 'IMPORT_REQUEST', 'OTHER');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentModule" AS ENUM ('PURCHASING', 'SUPPLIER', 'QUALITY', 'PRODUCTION', 'SHIPMENT', 'MAINTENANCE', 'SALES', 'IMPORT', 'ACCOUNTING', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AssignmentEntityType" AS ENUM ('PURCHASE_INVOICE', 'PURCHASE_REQUEST', 'PURCHASE_ORDER', 'SUPPLIER', 'SUPPLIER_DOCUMENT', 'QUALITY_INSPECTION', 'QUALITY_CERTIFICATE', 'PRODUCTION_ORDER', 'PRODUCTION_BATCH', 'SHIPMENT_PLAN', 'DISPATCH_NOTE', 'MAINTENANCE_RECORD', 'EQUIPMENT', 'SALES_ORDER', 'IMPORT_REQUEST', 'OTHER');

-- CreateEnum
CREATE TYPE "AssignmentRole" AS ENUM ('RESPONSIBLE', 'VIEWER', 'APPROVER', 'REQUESTER', 'OWNER', 'FOLLOWER');

-- CreateEnum
CREATE TYPE "DocumentModule" AS ENUM ('PURCHASING', 'SUPPLIER', 'QUALITY', 'PRODUCTION', 'SHIPMENT', 'MAINTENANCE', 'EMPLOYEE', 'ACCOUNTING', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DocumentEntityType" AS ENUM ('PURCHASE_INVOICE', 'PURCHASE_REQUEST', 'PURCHASE_ORDER', 'SUPPLIER', 'SUPPLIER_DOCUMENT', 'QUALITY_INSPECTION', 'QUALITY_CERTIFICATE', 'PRODUCTION_ORDER', 'PRODUCTION_BATCH', 'SHIPMENT_PLAN', 'DISPATCH_NOTE', 'MAINTENANCE_RECORD', 'EQUIPMENT', 'EMPLOYEE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'ISO_9001', 'ISO_14001', 'ISO_45001', 'ISO_50001', 'COA', 'ANALYSIS_REPORT', 'DELIVERY_NOTE', 'PACKING_LIST', 'MAINTENANCE_FORM', 'EMPLOYEE_DOCUMENT', 'OTHER');

-- DropForeignKey
ALTER TABLE "equipments" DROP CONSTRAINT "equipments_locationId_fkey";

-- DropForeignKey
ALTER TABLE "fault_maintenances" DROP CONSTRAINT "fault_maintenances_mainMachineId_fkey";

-- DropForeignKey
ALTER TABLE "fault_maintenances" DROP CONSTRAINT "fault_maintenances_subMachineId_fkey";

-- DropForeignKey
ALTER TABLE "fault_maintenances" DROP CONSTRAINT "fault_maintenances_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "periodic_maintenances" DROP CONSTRAINT "periodic_maintenances_mainMachineId_fkey";

-- DropForeignKey
ALTER TABLE "periodic_maintenances" DROP CONSTRAINT "periodic_maintenances_subMachineId_fkey";

-- DropForeignKey
ALTER TABLE "periodic_maintenances" DROP CONSTRAINT "periodic_maintenances_supplierId_fkey";

-- DropIndex
DROP INDEX "equipments_machineType_idx";

-- AlterTable
ALTER TABLE "SupplierDocument" DROP COLUMN "fileName",
DROP COLUMN "fileUrl",
DROP COLUMN "uploadedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "equipments" DROP COLUMN "currency",
DROP COLUMN "machineType",
ADD COLUMN     "currencyId" TEXT,
ADD COLUMN     "machineTypeId" TEXT,
ALTER COLUMN "locationId" DROP NOT NULL,
ALTER COLUMN "locationId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "endexes";

-- DropTable
DROP TABLE "equipment_locations";

-- DropTable
DROP TABLE "fault_maintenances";

-- DropTable
DROP TABLE "periodic_maintenances";

-- DropTable
DROP TABLE "personels";

-- CreateTable
CREATE TABLE "maintenances" (
    "id" SERIAL NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "locationId" TEXT,
    "mainEquipmentId" INTEGER NOT NULL,
    "subEquipmentId" INTEGER,
    "supplierId" TEXT,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
    "requester" TEXT,
    "savedBy" TEXT,
    "revisedBy" TEXT,
    "revisedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "endOfWorkDescription" TEXT,
    "faultTypeId" TEXT,
    "reasonFailureId" TEXT,
    "workStartDateTime" TIMESTAMP(3),
    "workEndDateTime" TIMESTAMP(3),
    "invoiceDate" TIMESTAMP(3),
    "invoicePrice" DECIMAL(18,2),
    "currencyId" TEXT,
    "firstPeriodicMaintenanceDate" TIMESTAMP(3),
    "annualPlanned" TEXT,
    "whichMaintenance" INTEGER,
    "totalPriceWithMaterialAndWorking" DECIMAL(18,2),
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_workers" (
    "id" SERIAL NOT NULL,
    "maintenanceId" INTEGER NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workDescription" TEXT,
    "workMinute" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_materials" (
    "id" SERIAL NOT NULL,
    "maintenanceId" INTEGER NOT NULL,
    "materialName" TEXT NOT NULL,
    "quantity" DECIMAL(18,4),
    "unit" TEXT,
    "unitPrice" DECIMAL(18,4),
    "currencyId" TEXT,
    "totalPrice" DECIMAL(18,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_schedules" (
    "id" SERIAL NOT NULL,
    "maintenanceId" INTEGER NOT NULL,
    "plannedDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_meters" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "meterTypeId" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "utility_meters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_meter_readings" (
    "id" TEXT NOT NULL,
    "meterId" TEXT NOT NULL,
    "readingDate" DATE NOT NULL,
    "value" DECIMAL(18,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utility_meter_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_meter_types" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultUnit" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utility_meter_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "module" "ApprovalModule" NOT NULL,
    "entityType" "ApprovalEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT,
    "approverId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "module" "AssignmentModule" NOT NULL,
    "entityType" "AssignmentEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "AssignmentRole" NOT NULL DEFAULT 'RESPONSIBLE',
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "module" "DocumentModule" NOT NULL,
    "entityType" "DocumentEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "title" TEXT,
    "description" TEXT,
    "originalFileName" TEXT NOT NULL,
    "storedFileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileExtension" TEXT,
    "sizeBytes" INTEGER,
    "storageProvider" TEXT,
    "uploadedById" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maintenances_type_idx" ON "maintenances"("type");

-- CreateIndex
CREATE INDEX "maintenances_locationId_idx" ON "maintenances"("locationId");

-- CreateIndex
CREATE INDEX "maintenances_mainEquipmentId_idx" ON "maintenances"("mainEquipmentId");

-- CreateIndex
CREATE INDEX "maintenances_subEquipmentId_idx" ON "maintenances"("subEquipmentId");

-- CreateIndex
CREATE INDEX "maintenances_supplierId_idx" ON "maintenances"("supplierId");

-- CreateIndex
CREATE INDEX "maintenances_faultTypeId_idx" ON "maintenances"("faultTypeId");

-- CreateIndex
CREATE INDEX "maintenances_reasonFailureId_idx" ON "maintenances"("reasonFailureId");

-- CreateIndex
CREATE INDEX "maintenances_currencyId_idx" ON "maintenances"("currencyId");

-- CreateIndex
CREATE INDEX "maintenances_status_idx" ON "maintenances"("status");

-- CreateIndex
CREATE INDEX "maintenances_deletedAt_idx" ON "maintenances"("deletedAt");

-- CreateIndex
CREATE INDEX "maintenance_workers_maintenanceId_idx" ON "maintenance_workers"("maintenanceId");

-- CreateIndex
CREATE INDEX "maintenance_workers_employeeId_idx" ON "maintenance_workers"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_workers_maintenanceId_employeeId_key" ON "maintenance_workers"("maintenanceId", "employeeId");

-- CreateIndex
CREATE INDEX "maintenance_materials_maintenanceId_idx" ON "maintenance_materials"("maintenanceId");

-- CreateIndex
CREATE INDEX "maintenance_materials_materialName_idx" ON "maintenance_materials"("materialName");

-- CreateIndex
CREATE INDEX "maintenance_materials_currencyId_idx" ON "maintenance_materials"("currencyId");

-- CreateIndex
CREATE INDEX "maintenance_schedules_maintenanceId_idx" ON "maintenance_schedules"("maintenanceId");

-- CreateIndex
CREATE INDEX "maintenance_schedules_plannedDate_idx" ON "maintenance_schedules"("plannedDate");

-- CreateIndex
CREATE INDEX "maintenance_schedules_actualDate_idx" ON "maintenance_schedules"("actualDate");

-- CreateIndex
CREATE INDEX "maintenance_schedules_status_idx" ON "maintenance_schedules"("status");

-- CreateIndex
CREATE UNIQUE INDEX "utility_meters_code_key" ON "utility_meters"("code");

-- CreateIndex
CREATE INDEX "utility_meters_meterTypeId_idx" ON "utility_meters"("meterTypeId");

-- CreateIndex
CREATE INDEX "utility_meters_isActive_idx" ON "utility_meters"("isActive");

-- CreateIndex
CREATE INDEX "utility_meter_readings_meterId_idx" ON "utility_meter_readings"("meterId");

-- CreateIndex
CREATE INDEX "utility_meter_readings_readingDate_idx" ON "utility_meter_readings"("readingDate");

-- CreateIndex
CREATE UNIQUE INDEX "utility_meter_readings_meterId_readingDate_key" ON "utility_meter_readings"("meterId", "readingDate");

-- CreateIndex
CREATE UNIQUE INDEX "utility_meter_types_legacyId_key" ON "utility_meter_types"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "utility_meter_types_code_key" ON "utility_meter_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "utility_meter_types_name_key" ON "utility_meter_types"("name");

-- CreateIndex
CREATE INDEX "approvals_module_idx" ON "approvals"("module");

-- CreateIndex
CREATE INDEX "approvals_entityType_entityId_idx" ON "approvals"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "approvals_status_idx" ON "approvals"("status");

-- CreateIndex
CREATE INDEX "approvals_requestedById_idx" ON "approvals"("requestedById");

-- CreateIndex
CREATE INDEX "approvals_approverId_idx" ON "approvals"("approverId");

-- CreateIndex
CREATE INDEX "approvals_requestedAt_idx" ON "approvals"("requestedAt");

-- CreateIndex
CREATE INDEX "approvals_decidedAt_idx" ON "approvals"("decidedAt");

-- CreateIndex
CREATE UNIQUE INDEX "approvals_module_entityType_entityId_key" ON "approvals"("module", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "assignments_module_idx" ON "assignments"("module");

-- CreateIndex
CREATE INDEX "assignments_entityType_entityId_idx" ON "assignments"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "assignments_userId_idx" ON "assignments"("userId");

-- CreateIndex
CREATE INDEX "assignments_role_idx" ON "assignments"("role");

-- CreateIndex
CREATE INDEX "assignments_createdById_idx" ON "assignments"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_module_entityType_entityId_userId_role_key" ON "assignments"("module", "entityType", "entityId", "userId", "role");

-- CreateIndex
CREATE INDEX "documents_module_idx" ON "documents"("module");

-- CreateIndex
CREATE INDEX "documents_entityType_entityId_idx" ON "documents"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "documents_documentType_idx" ON "documents"("documentType");

-- CreateIndex
CREATE INDEX "documents_uploadedById_idx" ON "documents"("uploadedById");

-- CreateIndex
CREATE INDEX "documents_isActive_idx" ON "documents"("isActive");

-- CreateIndex
CREATE INDEX "equipments_machineTypeId_idx" ON "equipments"("machineTypeId");

-- CreateIndex
CREATE INDEX "equipments_currencyId_idx" ON "equipments"("currencyId");

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_mainEquipmentId_fkey" FOREIGN KEY ("mainEquipmentId") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_subEquipmentId_fkey" FOREIGN KEY ("subEquipmentId") REFERENCES "equipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_faultTypeId_fkey" FOREIGN KEY ("faultTypeId") REFERENCES "FaultType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_reasonFailureId_fkey" FOREIGN KEY ("reasonFailureId") REFERENCES "FailureReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_workers" ADD CONSTRAINT "maintenance_workers_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_workers" ADD CONSTRAINT "maintenance_workers_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_materials" ADD CONSTRAINT "maintenance_materials_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_materials" ADD CONSTRAINT "maintenance_materials_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_meters" ADD CONSTRAINT "utility_meters_meterTypeId_fkey" FOREIGN KEY ("meterTypeId") REFERENCES "utility_meter_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_meter_readings" ADD CONSTRAINT "utility_meter_readings_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "utility_meters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_machineTypeId_fkey" FOREIGN KEY ("machineTypeId") REFERENCES "MachineType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
