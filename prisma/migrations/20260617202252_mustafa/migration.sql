/*
  Warnings:

  - You are about to alter the column `value` on the `countries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the `machine_trade_marks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `main_machines` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sub_machines` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[iso2]` on the table `countries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `iso2` to the `countries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneCode` to the `countries` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EquipmentLevel" AS ENUM ('MAIN', 'SUB');

-- DropForeignKey
ALTER TABLE "fault_maintenances" DROP CONSTRAINT "fault_maintenances_mainMachineId_fkey";

-- DropForeignKey
ALTER TABLE "fault_maintenances" DROP CONSTRAINT "fault_maintenances_subMachineId_fkey";

-- DropForeignKey
ALTER TABLE "main_machines" DROP CONSTRAINT "main_machines_tradeMarkId_fkey";

-- DropForeignKey
ALTER TABLE "periodic_maintenances" DROP CONSTRAINT "periodic_maintenances_mainMachineId_fkey";

-- DropForeignKey
ALTER TABLE "periodic_maintenances" DROP CONSTRAINT "periodic_maintenances_subMachineId_fkey";

-- DropForeignKey
ALTER TABLE "sub_machines" DROP CONSTRAINT "sub_machines_mainMachineId_fkey";

-- DropForeignKey
ALTER TABLE "sub_machines" DROP CONSTRAINT "sub_machines_tradeMarkId_fkey";

-- AlterTable
ALTER TABLE "countries" ADD COLUMN     "iso2" VARCHAR(2) NOT NULL,
ADD COLUMN     "phoneCode" VARCHAR(10) NOT NULL,
ALTER COLUMN "value" SET DATA TYPE VARCHAR(255);

-- DropTable
DROP TABLE "machine_trade_marks";

-- DropTable
DROP TABLE "main_machines";

-- DropTable
DROP TABLE "sub_machines";

-- CreateTable
CREATE TABLE "equipments" (
    "id" SERIAL NOT NULL,
    "equipmentCode" TEXT,
    "equipmentName" TEXT NOT NULL,
    "level" "EquipmentLevel" NOT NULL DEFAULT 'MAIN',
    "parentId" INTEGER,
    "locationId" INTEGER NOT NULL,
    "commissioningDate" TIMESTAMP(3),
    "tradeMarkId" INTEGER,
    "model" TEXT,
    "productionYear" INTEGER,
    "machineType" TEXT,
    "isExproof" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(18,2),
    "currency" TEXT,
    "isScrap" BOOLEAN NOT NULL DEFAULT false,
    "scrapDate" TIMESTAMP(3),
    "lastMaintenanceDate" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_locations" (
    "id" SERIAL NOT NULL,
    "locationName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "equipment_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_trade_marks" (
    "id" SERIAL NOT NULL,
    "tradeMark" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "equipment_trade_marks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "equipments_equipmentCode_key" ON "equipments"("equipmentCode");

-- CreateIndex
CREATE INDEX "equipments_equipmentName_idx" ON "equipments"("equipmentName");

-- CreateIndex
CREATE INDEX "equipments_level_idx" ON "equipments"("level");

-- CreateIndex
CREATE INDEX "equipments_parentId_idx" ON "equipments"("parentId");

-- CreateIndex
CREATE INDEX "equipments_locationId_idx" ON "equipments"("locationId");

-- CreateIndex
CREATE INDEX "equipments_tradeMarkId_idx" ON "equipments"("tradeMarkId");

-- CreateIndex
CREATE INDEX "equipments_machineType_idx" ON "equipments"("machineType");

-- CreateIndex
CREATE INDEX "equipments_isScrap_idx" ON "equipments"("isScrap");

-- CreateIndex
CREATE INDEX "equipments_deletedAt_idx" ON "equipments"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_locations_locationName_key" ON "equipment_locations"("locationName");

-- CreateIndex
CREATE INDEX "equipment_locations_locationName_idx" ON "equipment_locations"("locationName");

-- CreateIndex
CREATE INDEX "equipment_locations_deletedAt_idx" ON "equipment_locations"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_trade_marks_tradeMark_key" ON "equipment_trade_marks"("tradeMark");

-- CreateIndex
CREATE INDEX "equipment_trade_marks_tradeMark_idx" ON "equipment_trade_marks"("tradeMark");

-- CreateIndex
CREATE INDEX "equipment_trade_marks_deletedAt_idx" ON "equipment_trade_marks"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso2_key" ON "countries"("iso2");

-- CreateIndex
CREATE INDEX "countries_value_idx" ON "countries"("value");

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "equipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "equipment_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_tradeMarkId_fkey" FOREIGN KEY ("tradeMarkId") REFERENCES "equipment_trade_marks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fault_maintenances" ADD CONSTRAINT "fault_maintenances_mainMachineId_fkey" FOREIGN KEY ("mainMachineId") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fault_maintenances" ADD CONSTRAINT "fault_maintenances_subMachineId_fkey" FOREIGN KEY ("subMachineId") REFERENCES "equipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodic_maintenances" ADD CONSTRAINT "periodic_maintenances_mainMachineId_fkey" FOREIGN KEY ("mainMachineId") REFERENCES "equipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodic_maintenances" ADD CONSTRAINT "periodic_maintenances_subMachineId_fkey" FOREIGN KEY ("subMachineId") REFERENCES "equipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
