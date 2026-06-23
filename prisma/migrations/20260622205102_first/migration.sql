/*
  Warnings:

  - The `bloodTypeId` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `locationId` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Lookup_BloodType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_BloodType` table. All the data in the column will be lost.
  - The primary key for the `Lookup_Currency` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_Currency` table. All the data in the column will be lost.
  - The primary key for the `Lookup_FaultType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_FaultType` table. All the data in the column will be lost.
  - The primary key for the `Lookup_Location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_Location` table. All the data in the column will be lost.
  - The primary key for the `Lookup_MachineType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_MachineType` table. All the data in the column will be lost.
  - The primary key for the `Lookup_PaymentTerm` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_PaymentTerm` table. All the data in the column will be lost.
  - The primary key for the `Lookup_PlaceOfUse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_PlaceOfUse` table. All the data in the column will be lost.
  - The primary key for the `Lookup_ProductionYear` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_ProductionYear` table. All the data in the column will be lost.
  - The primary key for the `Lookup_PurchaseReason` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_PurchaseReason` table. All the data in the column will be lost.
  - The primary key for the `Lookup_Purchased` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_Purchased` table. All the data in the column will be lost.
  - The primary key for the `Lookup_ReasonFailure` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_ReasonFailure` table. All the data in the column will be lost.
  - The primary key for the `Lookup_SubRegion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_SubRegion` table. All the data in the column will be lost.
  - The primary key for the `Lookup_SupplierPoint` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_SupplierPoint` table. All the data in the column will be lost.
  - The primary key for the `Lookup_TankFarm` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_TankFarm` table. All the data in the column will be lost.
  - The primary key for the `Lookup_TaxOffice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_TaxOffice` table. All the data in the column will be lost.
  - The primary key for the `Lookup_TaxRatio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_TaxRatio` table. All the data in the column will be lost.
  - The primary key for the `Lookup_TransportType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `legacyId` on the `Lookup_TransportType` table. All the data in the column will be lost.
  - The primary key for the `Lookup_Unit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `Lookup_BloodType` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_Currency` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_FaultType` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_Location` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_MachineType` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_PaymentTerm` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_PlaceOfUse` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_ProductionYear` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_PurchaseReason` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_Purchased` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_ReasonFailure` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_SubRegion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_SupplierPoint` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_TankFarm` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_TaxOffice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_TaxRatio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_TransportType` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Lookup_Unit` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_bloodTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_locationId_fkey";

-- DropIndex
DROP INDEX "Lookup_BloodType_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_Currency_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_FaultType_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_Location_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_MachineType_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_PaymentTerm_scope_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_PlaceOfUse_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_ProductionYear_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_PurchaseReason_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_Purchased_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_ReasonFailure_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_SubRegion_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_SupplierPoint_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_TankFarm_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_TaxOffice_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_TaxRatio_legacyId_key";

-- DropIndex
DROP INDEX "Lookup_TransportType_legacyId_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "bloodTypeId",
ADD COLUMN     "bloodTypeId" INTEGER,
DROP COLUMN "locationId",
ADD COLUMN     "locationId" INTEGER;

-- AlterTable
ALTER TABLE "Lookup_BloodType" DROP CONSTRAINT "Lookup_BloodType_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_BloodType_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_Currency" DROP CONSTRAINT "Lookup_Currency_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_Currency_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_FaultType" DROP CONSTRAINT "Lookup_FaultType_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_FaultType_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_Location" DROP CONSTRAINT "Lookup_Location_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_Location_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_MachineType" DROP CONSTRAINT "Lookup_MachineType_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_MachineType_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_PaymentTerm" DROP CONSTRAINT "Lookup_PaymentTerm_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_PaymentTerm_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_PlaceOfUse" DROP CONSTRAINT "Lookup_PlaceOfUse_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_PlaceOfUse_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_ProductionYear" DROP CONSTRAINT "Lookup_ProductionYear_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_ProductionYear_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_PurchaseReason" DROP CONSTRAINT "Lookup_PurchaseReason_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_PurchaseReason_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_Purchased" DROP CONSTRAINT "Lookup_Purchased_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_Purchased_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_ReasonFailure" DROP CONSTRAINT "Lookup_ReasonFailure_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_ReasonFailure_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_SubRegion" DROP CONSTRAINT "Lookup_SubRegion_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_SubRegion_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_SupplierPoint" DROP CONSTRAINT "Lookup_SupplierPoint_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_SupplierPoint_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_TankFarm" DROP CONSTRAINT "Lookup_TankFarm_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_TankFarm_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_TaxOffice" DROP CONSTRAINT "Lookup_TaxOffice_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_TaxOffice_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_TaxRatio" DROP CONSTRAINT "Lookup_TaxRatio_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_TaxRatio_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_TransportType" DROP CONSTRAINT "Lookup_TransportType_pkey",
DROP COLUMN "legacyId",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_TransportType_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lookup_Unit" DROP CONSTRAINT "Lookup_Unit_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Lookup_Unit_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "Employee_bloodTypeId_idx" ON "Employee"("bloodTypeId");

-- CreateIndex
CREATE INDEX "Employee_locationId_idx" ON "Employee"("locationId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_bloodTypeId_fkey" FOREIGN KEY ("bloodTypeId") REFERENCES "Lookup_BloodType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Lookup_Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
