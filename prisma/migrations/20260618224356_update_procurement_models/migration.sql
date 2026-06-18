/*
  Warnings:

  - The values [WHATSAPP,PHONE] on the enum `PriceRecordSource` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `currency` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `paymentTerm` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `rawMaterialName` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `RawMaterialPriceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `paymentTerm` on the `RawMaterialPriceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `rawMaterialName` on the `RawMaterialPriceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `RawMaterialPriceRecord` table. All the data in the column will be lost.
  - You are about to drop the column `channel` on the `RawMaterialPriceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `rawMaterialName` on the `RawMaterialPriceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `channel` on the `RawMaterialPriceRequestDraft` table. All the data in the column will be lost.
  - You are about to drop the column `channel` on the `RawMaterialPriceRequestSupplier` table. All the data in the column will be lost.
  - You are about to drop the column `sendMode` on the `RawMaterialPurchaseSettings` table. All the data in the column will be lost.
  - You are about to drop the column `rawMaterialName` on the `RawMaterialReceiptItem` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `RawMaterialReceiptItem` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `taxOffice` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `SupplierRawMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `requester` on the `maintenances` table. All the data in the column will be lost.
  - You are about to drop the column `revisedBy` on the `maintenances` table. All the data in the column will be lost.
  - You are about to drop the column `savedBy` on the `maintenances` table. All the data in the column will be lost.
  - You are about to drop the `PurchaseOrderAttachment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[supplierId,rawMaterialId]` on the table `SupplierRawMaterial` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rawMaterialId` to the `RawMaterialPriceRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rawMaterialId` to the `RawMaterialReceiptItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rawMaterialId` to the `SupplierRawMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PurchaseRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ORDERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchaseRequestPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "PurchaseCategory" AS ENUM ('RAW_MATERIAL', 'PACKAGING', 'MATERIAL', 'TRADE_PRODUCT', 'SERVICE', 'TRANSPORT');

-- AlterEnum
BEGIN;
CREATE TYPE "PriceRecordSource_new" AS ENUM ('MANUAL', 'MAIL');
ALTER TABLE "public"."RawMaterialPriceRecord" ALTER COLUMN "source" DROP DEFAULT;
ALTER TABLE "RawMaterialPriceRecord" ALTER COLUMN "source" TYPE "PriceRecordSource_new" USING ("source"::text::"PriceRecordSource_new");
ALTER TYPE "PriceRecordSource" RENAME TO "PriceRecordSource_old";
ALTER TYPE "PriceRecordSource_new" RENAME TO "PriceRecordSource";
DROP TYPE "public"."PriceRecordSource_old";
ALTER TABLE "RawMaterialPriceRecord" ALTER COLUMN "source" SET DEFAULT 'MANUAL';
COMMIT;

-- DropForeignKey
ALTER TABLE "PurchaseOrderAttachment" DROP CONSTRAINT "PurchaseOrderAttachment_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierRawMaterial" DROP CONSTRAINT "SupplierRawMaterial_productId_fkey";

-- DropIndex
DROP INDEX "PurchaseOrderItem_rawMaterialName_idx";

-- DropIndex
DROP INDEX "RawMaterialPriceRecord_paymentTerm_idx";

-- DropIndex
DROP INDEX "RawMaterialPriceRecord_rawMaterialName_idx";

-- DropIndex
DROP INDEX "RawMaterialPriceRequest_rawMaterialName_idx";

-- DropIndex
DROP INDEX "RawMaterialPriceRequestDraft_channel_idx";

-- DropIndex
DROP INDEX "RawMaterialReceiptItem_rawMaterialName_idx";

-- DropIndex
DROP INDEX "Supplier_city_idx";

-- DropIndex
DROP INDEX "Supplier_country_idx";

-- DropIndex
DROP INDEX "Supplier_district_idx";

-- DropIndex
DROP INDEX "SupplierRawMaterial_productId_idx";

-- DropIndex
DROP INDEX "SupplierRawMaterial_supplierId_productId_key";

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "currency",
DROP COLUMN "paymentTerm",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "currencyId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isDifferentVat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isInsurance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isStopaj" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTevkifat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentTermId" TEXT,
ADD COLUMN     "placeOfUseId" TEXT,
ADD COLUMN     "purchaseReasonId" TEXT,
ADD COLUMN     "purchaseRequestId" TEXT,
ADD COLUMN     "purchasedTypeId" TEXT,
ADD COLUMN     "stopajRatio" DECIMAL(8,2),
ADD COLUMN     "supplierPointId" TEXT,
ADD COLUMN     "tevkifatRatio" DECIMAL(8,2),
ADD COLUMN     "totalStopaj" DECIMAL(18,2),
ADD COLUMN     "totalTax" DECIMAL(18,2),
ADD COLUMN     "totalTevkifat" DECIMAL(18,2),
ADD COLUMN     "totalWithTax" DECIMAL(18,2),
ADD COLUMN     "totalWithoutTax" DECIMAL(18,2),
ADD COLUMN     "transportTypeId" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrderItem" DROP COLUMN "currency",
DROP COLUMN "rawMaterialName",
DROP COLUMN "unit",
ADD COLUMN     "category" "PurchaseCategory" NOT NULL DEFAULT 'MATERIAL',
ADD COLUMN     "currencyId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "differentVatRatioId" TEXT,
ADD COLUMN     "materialName" TEXT,
ADD COLUMN     "purchaseRequestItemId" TEXT,
ADD COLUMN     "rawMaterialId" TEXT,
ADD COLUMN     "serviceName" TEXT,
ADD COLUMN     "taxAmount" DECIMAL(18,2),
ADD COLUMN     "taxRatioId" TEXT,
ADD COLUMN     "totalWithTax" DECIMAL(18,2),
ADD COLUMN     "totalWithoutTax" DECIMAL(18,2),
ADD COLUMN     "unitId" TEXT;

-- AlterTable
ALTER TABLE "RawMaterialPriceRecord" DROP COLUMN "currency",
DROP COLUMN "paymentTerm",
DROP COLUMN "rawMaterialName",
DROP COLUMN "unit",
ADD COLUMN     "currencyId" TEXT,
ADD COLUMN     "paymentTermId" TEXT,
ADD COLUMN     "rawMaterialId" TEXT NOT NULL,
ADD COLUMN     "unitId" TEXT;

-- AlterTable
ALTER TABLE "RawMaterialPriceRequest" DROP COLUMN "channel",
DROP COLUMN "rawMaterialName",
ADD COLUMN     "rawMaterialId" TEXT;

-- AlterTable
ALTER TABLE "RawMaterialPriceRequestDraft" DROP COLUMN "channel",
ADD COLUMN     "language" "PurchaseMessageLanguage" NOT NULL DEFAULT 'EN';

-- AlterTable
ALTER TABLE "RawMaterialPriceRequestSupplier" DROP COLUMN "channel";

-- AlterTable
ALTER TABLE "RawMaterialPurchaseSettings" DROP COLUMN "sendMode";

-- AlterTable
ALTER TABLE "RawMaterialReceiptItem" DROP COLUMN "rawMaterialName",
DROP COLUMN "unit",
ADD COLUMN     "rawMaterialId" TEXT NOT NULL,
ADD COLUMN     "unitId" TEXT;

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "district",
DROP COLUMN "taxOffice",
ADD COLUMN     "cityId" INTEGER,
ADD COLUMN     "countryId" INTEGER,
ADD COLUMN     "districtId" INTEGER,
ADD COLUMN     "taxOfficeId" TEXT;

-- AlterTable
ALTER TABLE "SupplierRawMaterial" DROP COLUMN "productId",
ADD COLUMN     "rawMaterialId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "maintenances" DROP COLUMN "requester",
DROP COLUMN "revisedBy",
DROP COLUMN "savedBy",
ADD COLUMN     "requestedByEmployeeId" TEXT,
ADD COLUMN     "revisedById" TEXT,
ADD COLUMN     "savedById" TEXT,
ALTER COLUMN "revisedDate" DROP NOT NULL,
ALTER COLUMN "revisedDate" DROP DEFAULT;

-- DropTable
DROP TABLE "PurchaseOrderAttachment";

-- DropEnum
DROP TYPE "PriceRequestChannel";

-- DropEnum
DROP TYPE "PurchaseSendMode";

-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "id" TEXT NOT NULL,
    "requestNo" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "departmentId" TEXT,
    "status" "PurchaseRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "PurchaseRequestPriority" NOT NULL DEFAULT 'NORMAL',
    "requestedDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "neededDate" DATE,
    "reason" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequestItem" (
    "id" TEXT NOT NULL,
    "purchaseRequestId" TEXT NOT NULL,
    "category" "PurchaseCategory" NOT NULL,
    "rawMaterialId" TEXT,
    "productId" TEXT,
    "serviceName" TEXT,
    "materialName" TEXT,
    "description" TEXT,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unitId" TEXT,
    "estimatedUnitPrice" DECIMAL(18,4),
    "currencyId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterial_code_key" ON "RawMaterial"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterial_name_key" ON "RawMaterial"("name");

-- CreateIndex
CREATE INDEX "RawMaterial_name_idx" ON "RawMaterial"("name");

-- CreateIndex
CREATE INDEX "RawMaterial_isActive_idx" ON "RawMaterial"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseRequest_requestNo_key" ON "PurchaseRequest"("requestNo");

-- CreateIndex
CREATE INDEX "PurchaseRequest_requestNo_idx" ON "PurchaseRequest"("requestNo");

-- CreateIndex
CREATE INDEX "PurchaseRequest_requestedById_idx" ON "PurchaseRequest"("requestedById");

-- CreateIndex
CREATE INDEX "PurchaseRequest_departmentId_idx" ON "PurchaseRequest"("departmentId");

-- CreateIndex
CREATE INDEX "PurchaseRequest_status_idx" ON "PurchaseRequest"("status");

-- CreateIndex
CREATE INDEX "PurchaseRequest_priority_idx" ON "PurchaseRequest"("priority");

-- CreateIndex
CREATE INDEX "PurchaseRequest_requestedDate_idx" ON "PurchaseRequest"("requestedDate");

-- CreateIndex
CREATE INDEX "PurchaseRequest_neededDate_idx" ON "PurchaseRequest"("neededDate");

-- CreateIndex
CREATE INDEX "PurchaseRequest_deletedAt_idx" ON "PurchaseRequest"("deletedAt");

-- CreateIndex
CREATE INDEX "PurchaseRequestItem_unitId_idx" ON "PurchaseRequestItem"("unitId");

-- CreateIndex
CREATE INDEX "PurchaseRequestItem_purchaseRequestId_idx" ON "PurchaseRequestItem"("purchaseRequestId");

-- CreateIndex
CREATE INDEX "PurchaseRequestItem_category_idx" ON "PurchaseRequestItem"("category");

-- CreateIndex
CREATE INDEX "PurchaseRequestItem_rawMaterialId_idx" ON "PurchaseRequestItem"("rawMaterialId");

-- CreateIndex
CREATE INDEX "PurchaseRequestItem_productId_idx" ON "PurchaseRequestItem"("productId");

-- CreateIndex
CREATE INDEX "PurchaseRequestItem_currencyId_idx" ON "PurchaseRequestItem"("currencyId");

-- CreateIndex
CREATE UNIQUE INDEX "units_code_key" ON "units"("code");

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "units"("name");

-- CreateIndex
CREATE INDEX "units_code_idx" ON "units"("code");

-- CreateIndex
CREATE INDEX "units_name_idx" ON "units"("name");

-- CreateIndex
CREATE INDEX "units_isActive_idx" ON "units"("isActive");

-- CreateIndex
CREATE INDEX "PurchaseOrder_purchaseRequestId_idx" ON "PurchaseOrder"("purchaseRequestId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_purchaseReasonId_idx" ON "PurchaseOrder"("purchaseReasonId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_placeOfUseId_idx" ON "PurchaseOrder"("placeOfUseId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_purchasedTypeId_idx" ON "PurchaseOrder"("purchasedTypeId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_transportTypeId_idx" ON "PurchaseOrder"("transportTypeId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_paymentTermId_idx" ON "PurchaseOrder"("paymentTermId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_currencyId_idx" ON "PurchaseOrder"("currencyId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierPointId_idx" ON "PurchaseOrder"("supplierPointId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_createdById_idx" ON "PurchaseOrder"("createdById");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_purchaseRequestItemId_idx" ON "PurchaseOrderItem"("purchaseRequestItemId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_category_idx" ON "PurchaseOrderItem"("category");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_rawMaterialId_idx" ON "PurchaseOrderItem"("rawMaterialId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_unitId_idx" ON "PurchaseOrderItem"("unitId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_currencyId_idx" ON "PurchaseOrderItem"("currencyId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_taxRatioId_idx" ON "PurchaseOrderItem"("taxRatioId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_differentVatRatioId_idx" ON "PurchaseOrderItem"("differentVatRatioId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_unitId_idx" ON "RawMaterialPriceRecord"("unitId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_rawMaterialId_idx" ON "RawMaterialPriceRecord"("rawMaterialId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_currencyId_idx" ON "RawMaterialPriceRecord"("currencyId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_paymentTermId_idx" ON "RawMaterialPriceRecord"("paymentTermId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequest_rawMaterialId_idx" ON "RawMaterialPriceRequest"("rawMaterialId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequestDraft_language_idx" ON "RawMaterialPriceRequestDraft"("language");

-- CreateIndex
CREATE INDEX "RawMaterialReceiptItem_unitId_idx" ON "RawMaterialReceiptItem"("unitId");

-- CreateIndex
CREATE INDEX "RawMaterialReceiptItem_rawMaterialId_idx" ON "RawMaterialReceiptItem"("rawMaterialId");

-- CreateIndex
CREATE INDEX "Supplier_countryId_idx" ON "Supplier"("countryId");

-- CreateIndex
CREATE INDEX "Supplier_cityId_idx" ON "Supplier"("cityId");

-- CreateIndex
CREATE INDEX "Supplier_districtId_idx" ON "Supplier"("districtId");

-- CreateIndex
CREATE INDEX "Supplier_taxOfficeId_idx" ON "Supplier"("taxOfficeId");

-- CreateIndex
CREATE INDEX "SupplierRawMaterial_rawMaterialId_idx" ON "SupplierRawMaterial"("rawMaterialId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierRawMaterial_supplierId_rawMaterialId_key" ON "SupplierRawMaterial"("supplierId", "rawMaterialId");

-- CreateIndex
CREATE INDEX "maintenances_requestedByEmployeeId_idx" ON "maintenances"("requestedByEmployeeId");

-- CreateIndex
CREATE INDEX "maintenances_savedById_idx" ON "maintenances"("savedById");

-- CreateIndex
CREATE INDEX "maintenances_revisedById_idx" ON "maintenances"("revisedById");

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_requestedByEmployeeId_fkey" FOREIGN KEY ("requestedByEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_savedById_fkey" FOREIGN KEY ("savedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_revisedById_fkey" FOREIGN KEY ("revisedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRecord" ADD CONSTRAINT "RawMaterialPriceRecord_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRecord" ADD CONSTRAINT "RawMaterialPriceRecord_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRecord" ADD CONSTRAINT "RawMaterialPriceRecord_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "PaymentTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRecord" ADD CONSTRAINT "RawMaterialPriceRecord_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRequest" ADD CONSTRAINT "RawMaterialPriceRequest_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES "PurchaseRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_purchaseReasonId_fkey" FOREIGN KEY ("purchaseReasonId") REFERENCES "PurchaseReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_placeOfUseId_fkey" FOREIGN KEY ("placeOfUseId") REFERENCES "PlaceOfUse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_purchasedTypeId_fkey" FOREIGN KEY ("purchasedTypeId") REFERENCES "Purchased"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_transportTypeId_fkey" FOREIGN KEY ("transportTypeId") REFERENCES "TransportType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "PaymentTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierPointId_fkey" FOREIGN KEY ("supplierPointId") REFERENCES "SupplierPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES "PurchaseRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_taxRatioId_fkey" FOREIGN KEY ("taxRatioId") REFERENCES "TaxRatio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_differentVatRatioId_fkey" FOREIGN KEY ("differentVatRatioId") REFERENCES "TaxRatio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseRequestItemId_fkey" FOREIGN KEY ("purchaseRequestItemId") REFERENCES "PurchaseRequestItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialReceiptItem" ADD CONSTRAINT "RawMaterialReceiptItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialReceiptItem" ADD CONSTRAINT "RawMaterialReceiptItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_taxOfficeId_fkey" FOREIGN KEY ("taxOfficeId") REFERENCES "TaxOffice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierRawMaterial" ADD CONSTRAINT "SupplierRawMaterial_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
