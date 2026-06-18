/*
  Warnings:

  - You are about to drop the `LookupOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subregions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "subregions" DROP CONSTRAINT "subregions_countryId_fkey";

-- DropTable
DROP TABLE "LookupOption";

-- DropTable
DROP TABLE "subregions";

-- DropEnum
DROP TYPE "LookupOptionType";

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaultType" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaultType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineType" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MachineType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTerm" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "days" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaceOfUse" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaceOfUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionYear" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "year" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchased" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchased_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReason" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubRegion" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "countryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierPoint" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "value" INTEGER NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TankFarm" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TankFarm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRatio" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "value" DECIMAL(5,2) NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRatio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportType" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Currency_legacyId_key" ON "Currency"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FaultType_legacyId_key" ON "FaultType"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "FaultType_name_key" ON "FaultType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_legacyId_key" ON "Location"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MachineType_legacyId_key" ON "MachineType"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "MachineType_name_key" ON "MachineType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTerm_legacyId_key" ON "PaymentTerm"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTerm_name_key" ON "PaymentTerm"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceOfUse_legacyId_key" ON "PlaceOfUse"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceOfUse_name_key" ON "PlaceOfUse"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionYear_legacyId_key" ON "ProductionYear"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionYear_year_key" ON "ProductionYear"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Purchased_legacyId_key" ON "Purchased"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchased_name_key" ON "Purchased"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseReason_legacyId_key" ON "PurchaseReason"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseReason_name_key" ON "PurchaseReason"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubRegion_legacyId_key" ON "SubRegion"("legacyId");

-- CreateIndex
CREATE INDEX "SubRegion_countryId_idx" ON "SubRegion"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "SubRegion_countryId_name_key" ON "SubRegion"("countryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierPoint_legacyId_key" ON "SupplierPoint"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierPoint_value_key" ON "SupplierPoint"("value");

-- CreateIndex
CREATE UNIQUE INDEX "TankFarm_legacyId_key" ON "TankFarm"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "TankFarm_name_key" ON "TankFarm"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRatio_legacyId_key" ON "TaxRatio"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRatio_value_key" ON "TaxRatio"("value");

-- CreateIndex
CREATE UNIQUE INDEX "TransportType_legacyId_key" ON "TransportType"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "TransportType_name_key" ON "TransportType"("name");

-- AddForeignKey
ALTER TABLE "SubRegion" ADD CONSTRAINT "SubRegion_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
