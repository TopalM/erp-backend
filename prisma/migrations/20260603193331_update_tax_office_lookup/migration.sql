/*
  Warnings:

  - The values [QUALITY,COMMERCIAL] on the enum `SupplierEvaluationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `module` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `targetEmail` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `targetUserId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `commercialAverageScore` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `documentRequestEnabled` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `isDocumentNone` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `iso14001` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `iso45001` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `iso50001` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `iso9001` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `qualityAverageScore` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `rawMaterialName` on the `SupplierRawMaterial` table. All the data in the column will be lost.
  - The primary key for the `TaxRatio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Employee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SupplierContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tax_offices` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[supplierId,documentTypeId]` on the table `SupplierDocument` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `SupplierDocumentType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supplierId,productId]` on the table `SupplierRawMaterial` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `entityType` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `event` on the `AuthEventLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `cityId` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryId` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `Supplier` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Supplier` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Supplier` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contactName` on table `Supplier` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `code` to the `SupplierDocumentType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `SupplierEvaluation` table without a default value. This is not possible if the table is not empty.
  - Made the column `productId` on table `SupplierRawMaterial` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `id` on the `TaxRatio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AuthEventType" AS ENUM ('REGISTER_SUCCESS', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'ACCOUNT_LOCKED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'PASSWORD_CHANGED', 'EMAIL_VERIFICATION_SENT', 'EMAIL_VERIFICATION_FAILED', 'EMAIL_VERIFIED');

-- CreateEnum
CREATE TYPE "AuditModule" AS ENUM ('AUTH', 'USER', 'ROLE', 'PERMISSION', 'SUPPLIER', 'PRODUCT', 'PURCHASE', 'RAW_MATERIAL_RECEIPT', 'QUALITY', 'MAINTENANCE', 'PRODUCTION', 'STORAGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'UPLOAD', 'DOWNLOAD', 'ERROR');

-- CreateEnum
CREATE TYPE "SupplierEvaluationSource" AS ENUM ('PURCHASING', 'QUALITY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SupplierCategoryType" ADD VALUE 'PACKAGING';
ALTER TYPE "SupplierCategoryType" ADD VALUE 'TRADE_PRODUCT';
ALTER TYPE "SupplierCategoryType" ADD VALUE 'TRANSPORT';

-- AlterEnum
BEGIN;
CREATE TYPE "SupplierEvaluationType_new" AS ENUM ('PURCHASING_QUALITY', 'DELIVERY_TIME', 'DELIVERY_QUANTITY', 'PAYMENT_TERMS', 'SERVICE_QUALITY', 'SCHEDULE_ADHERENCE', 'PROBLEM_SOLVING', 'RAW_MATERIAL_QUALITY', 'COA_COMPLIANCE', 'QC_COMPLIANCE', 'LOT_TRACEABILITY', 'PACKAGING_CONDITION');
ALTER TABLE "SupplierEvaluation" ALTER COLUMN "evaluationType" TYPE "SupplierEvaluationType_new" USING ("evaluationType"::text::"SupplierEvaluationType_new");
ALTER TYPE "SupplierEvaluationType" RENAME TO "SupplierEvaluationType_old";
ALTER TYPE "SupplierEvaluationType_new" RENAME TO "SupplierEvaluationType";
DROP TYPE "public"."SupplierEvaluationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_userId_fkey";

-- DropForeignKey
ALTER TABLE "RawMaterialPriceRequestSupplier" DROP CONSTRAINT "RawMaterialPriceRequestSupplier_contactId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierContact" DROP CONSTRAINT "SupplierContact_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierRawMaterial" DROP CONSTRAINT "SupplierRawMaterial_productId_fkey";

-- DropForeignKey
ALTER TABLE "tax_offices" DROP CONSTRAINT "tax_offices_cityId_fkey";

-- DropIndex
DROP INDEX "SupplierRawMaterial_rawMaterialName_idx";

-- DropIndex
DROP INDEX "SupplierRawMaterial_supplierId_rawMaterialName_key";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "module",
DROP COLUMN "targetEmail",
DROP COLUMN "targetUserId",
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityType" "AuditModule" NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction" NOT NULL;

-- AlterTable
ALTER TABLE "AuthEventLog" DROP COLUMN "event",
ADD COLUMN     "event" "AuthEventType" NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "city",
DROP COLUMN "commercialAverageScore",
DROP COLUMN "country",
DROP COLUMN "district",
DROP COLUMN "documentRequestEnabled",
DROP COLUMN "isDocumentNone",
DROP COLUMN "iso14001",
DROP COLUMN "iso45001",
DROP COLUMN "iso50001",
DROP COLUMN "iso9001",
DROP COLUMN "qualityAverageScore",
ADD COLUMN     "cityId" INTEGER NOT NULL,
ADD COLUMN     "coaComplianceAverageScore" DECIMAL(8,2),
ADD COLUMN     "countryId" INTEGER NOT NULL,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "deletedById" TEXT,
ADD COLUMN     "deliveryQuantityAverageScore" DECIMAL(8,2),
ADD COLUMN     "deliveryTimeAverageScore" DECIMAL(8,2),
ADD COLUMN     "districtId" INTEGER,
ADD COLUMN     "lotTraceabilityAverageScore" DECIMAL(8,2),
ADD COLUMN     "packagingConditionAverageScore" DECIMAL(8,2),
ADD COLUMN     "paymentTermsAverageScore" DECIMAL(8,2),
ADD COLUMN     "problemSolvingAverageScore" DECIMAL(8,2),
ADD COLUMN     "purchasingQualityAverageScore" DECIMAL(8,2),
ADD COLUMN     "qcComplianceAverageScore" DECIMAL(8,2),
ADD COLUMN     "rawMaterialQualityAverageScore" DECIMAL(8,2),
ADD COLUMN     "scheduleAdherenceAverageScore" DECIMAL(8,2),
ADD COLUMN     "serviceQualityAverageScore" DECIMAL(8,2),
ADD COLUMN     "updatedById" TEXT,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "contactName" SET NOT NULL;

-- AlterTable
ALTER TABLE "SupplierDocument" ADD COLUMN     "isRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requestedAt" TIMESTAMP(3),
ALTER COLUMN "fileName" DROP NOT NULL,
ALTER COLUMN "fileUrl" DROP NOT NULL,
ALTER COLUMN "uploadedAt" DROP NOT NULL,
ALTER COLUMN "uploadedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SupplierDocumentType" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SupplierEvaluation" ADD COLUMN     "purchaseOrderId" TEXT,
ADD COLUMN     "qualityInspectionId" TEXT,
ADD COLUMN     "rawMaterialReceiptId" TEXT,
ADD COLUMN     "source" "SupplierEvaluationSource" NOT NULL;

-- AlterTable
ALTER TABLE "SupplierRawMaterial" DROP COLUMN "rawMaterialName",
ALTER COLUMN "productId" SET NOT NULL;

-- AlterTable
ALTER TABLE "TaxRatio" DROP CONSTRAINT "TaxRatio_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "TaxRatio_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Employee";

-- DropTable
DROP TABLE "SupplierContact";

-- DropTable
DROP TABLE "tax_offices";

-- DropEnum
DROP TYPE "EmployeeStatus";

-- DropEnum
DROP TYPE "SupplierContactType";

-- CreateTable
CREATE TABLE "FailureReason" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FailureReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxOffice" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "cityId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputControlAppearance" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InputControlAppearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityAppearance" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityAppearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialAnalysisParameter" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "unit" TEXT,
    "cleaned" BOOLEAN NOT NULL DEFAULT false,
    "customSelect" BOOLEAN NOT NULL DEFAULT false,
    "lengthValue" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialAnalysisParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialAnalysisOption" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "parameterId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialAnalysisOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialCategory" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialType" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FailureReason_legacyId_key" ON "FailureReason"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "FailureReason_name_key" ON "FailureReason"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TaxOffice_legacyId_key" ON "TaxOffice"("legacyId");

-- CreateIndex
CREATE INDEX "TaxOffice_cityId_idx" ON "TaxOffice"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxOffice_cityId_name_key" ON "TaxOffice"("cityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "InputControlAppearance_legacyId_key" ON "InputControlAppearance"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "InputControlAppearance_name_key" ON "InputControlAppearance"("name");

-- CreateIndex
CREATE UNIQUE INDEX "QualityAppearance_legacyId_key" ON "QualityAppearance"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "QualityAppearance_name_key" ON "QualityAppearance"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialAnalysisParameter_legacyId_key" ON "RawMaterialAnalysisParameter"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialAnalysisParameter_fieldKey_key" ON "RawMaterialAnalysisParameter"("fieldKey");

-- CreateIndex
CREATE INDEX "RawMaterialAnalysisParameter_isActive_idx" ON "RawMaterialAnalysisParameter"("isActive");

-- CreateIndex
CREATE INDEX "RawMaterialAnalysisOption_parameterId_idx" ON "RawMaterialAnalysisOption"("parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialAnalysisOption_parameterId_value_key" ON "RawMaterialAnalysisOption"("parameterId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialAnalysisOption_parameterId_legacyId_key" ON "RawMaterialAnalysisOption"("parameterId", "legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialCategory_legacyId_key" ON "RawMaterialCategory"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialCategory_name_key" ON "RawMaterialCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialType_legacyId_key" ON "RawMaterialType"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialType_name_key" ON "RawMaterialType"("name");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuthEventLog_userId_idx" ON "AuthEventLog"("userId");

-- CreateIndex
CREATE INDEX "AuthEventLog_email_idx" ON "AuthEventLog"("email");

-- CreateIndex
CREATE INDEX "AuthEventLog_event_idx" ON "AuthEventLog"("event");

-- CreateIndex
CREATE INDEX "AuthEventLog_createdAt_idx" ON "AuthEventLog"("createdAt");

-- CreateIndex
CREATE INDEX "Supplier_districtId_idx" ON "Supplier"("districtId");

-- CreateIndex
CREATE INDEX "Supplier_cityId_idx" ON "Supplier"("cityId");

-- CreateIndex
CREATE INDEX "Supplier_countryId_idx" ON "Supplier"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierDocument_supplierId_documentTypeId_key" ON "SupplierDocument"("supplierId", "documentTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierDocumentType_code_key" ON "SupplierDocumentType"("code");

-- CreateIndex
CREATE INDEX "SupplierEvaluation_purchaseOrderId_idx" ON "SupplierEvaluation"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "SupplierEvaluation_rawMaterialReceiptId_idx" ON "SupplierEvaluation"("rawMaterialReceiptId");

-- CreateIndex
CREATE INDEX "SupplierEvaluation_qualityInspectionId_idx" ON "SupplierEvaluation"("qualityInspectionId");

-- CreateIndex
CREATE INDEX "SupplierEvaluation_source_idx" ON "SupplierEvaluation"("source");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierRawMaterial_supplierId_productId_key" ON "SupplierRawMaterial"("supplierId", "productId");

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierRawMaterial" ADD CONSTRAINT "SupplierRawMaterial_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxOffice" ADD CONSTRAINT "TaxOffice_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialAnalysisOption" ADD CONSTRAINT "RawMaterialAnalysisOption_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "RawMaterialAnalysisParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
