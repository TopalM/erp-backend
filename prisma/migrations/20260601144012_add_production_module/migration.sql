-- CreateEnum
CREATE TYPE "ProductionJobType" AS ENUM ('PRODUCTION', 'BREAKDOWN');

-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('PLANNED', 'COMPLETED', 'CANCELLED', 'WAITING');

-- CreateEnum
CREATE TYPE "ProductionDelayReason" AS ENUM ('BREAKDOWN_INTERVENTION', 'MAINTENANCE', 'OPERATIONAL_WAITING', 'RAW_MATERIAL_WAITING', 'ANALYSIS_WAITING', 'CLEANING', 'OTHER');

-- CreateTable
CREATE TABLE "ProductionReactor" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "bg" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionReactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionPeriodSetting" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "reactorLoadOrder" JSONB,
    "maxProductionStart" TIMESTAMP(3),
    "maxProductionEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionPeriodSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionRawMaterialOrigin" (
    "id" TEXT NOT NULL,
    "rawMaterialKey" TEXT NOT NULL,
    "rawMaterialName" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionRawMaterialOrigin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionJob" (
    "id" TEXT NOT NULL,
    "type" "ProductionJobType" NOT NULL,
    "status" "ProductionStatus" NOT NULL,
    "year" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "reactorId" TEXT NOT NULL,
    "batchNo" TEXT,
    "productId" TEXT,
    "productCode" TEXT,
    "productName" TEXT,
    "plannedStart" TIMESTAMP(3) NOT NULL,
    "plannedEnd" TIMESTAMP(3) NOT NULL,
    "plannedDurationMinute" INTEGER NOT NULL,
    "plannedQuantity" DECIMAL(14,3),
    "plannedTwoEH" DECIMAL(14,3),
    "plannedPTA" DECIMAL(14,3),
    "formen" TEXT,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "actualDurationMinute" INTEGER,
    "actualQuantity" DECIMAL(14,3),
    "description" TEXT,
    "delayReason" "ProductionDelayReason",
    "rekuper" DECIMAL(14,3),
    "twoEthylAlcohol" DECIMAL(14,3),
    "totalTwoEthylAlcohol" DECIMAL(14,3),
    "twoEthylAlcoholLotNo" TEXT,
    "pta" DECIMAL(14,3),
    "ptaLotNo" TEXT,
    "aa" DECIMAL(14,3),
    "aaLotNo" TEXT,
    "tma" DECIMAL(14,3),
    "tmaLotNo" TEXT,
    "catalyst" DECIMAL(14,3),
    "catalystLotNo" TEXT,
    "causticSoda" DECIMAL(14,3),
    "reactionStartTime" TEXT,
    "reactionStartTemperature" DECIMAL(10,3),
    "reactionStartCatalystAmount" DECIMAL(14,3),
    "catalyst2Time" TEXT,
    "catalyst2Temperature" DECIMAL(10,3),
    "catalyst2Amount" DECIMAL(14,3),
    "catalyst3Time" TEXT,
    "catalyst3Temperature" DECIMAL(10,3),
    "catalyst3Amount" DECIMAL(14,3),
    "washingTime" TEXT,
    "washingTemperature" DECIMAL(10,3),
    "strippingStartTime" TEXT,
    "strippingStartTemperature" DECIMAL(10,3),
    "flashPointTime" TEXT,
    "flashPointTemperature" DECIMAL(10,3),
    "flashPointValue" DECIMAL(10,3),
    "hasFinalWashing" BOOLEAN NOT NULL DEFAULT false,
    "finalFlashPointTime" TEXT,
    "finalFlashPointTemperature" DECIMAL(10,3),
    "finalFlashPointValue" DECIMAL(10,3),
    "dryingStartTime" TEXT,
    "dryingEndTime" TEXT,
    "extraAlcohol1" DECIMAL(14,3),
    "extraAlcohol2" DECIMAL(14,3),
    "extraAlcohol3" DECIMAL(14,3),
    "rekuperLitre" DECIMAL(14,3),
    "dropTank" TEXT,
    "stockTank" TEXT,
    "productionBreakdownMinute" INTEGER,
    "productionBreakdownDescription" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionReactionRow" (
    "id" TEXT NOT NULL,
    "productionJobId" TEXT NOT NULL,
    "rowOrder" INTEGER NOT NULL,
    "time" TEXT,
    "temperature" DECIMAL(10,3),
    "acidIndex" DECIMAL(10,3),
    "consumption" DECIMAL(10,3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionReactionRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionInput" (
    "id" TEXT NOT NULL,
    "productionJobId" TEXT NOT NULL,
    "productId" TEXT,
    "rawMaterialReceiptItemId" TEXT,
    "rawMaterialName" TEXT,
    "lotNo" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unitName" TEXT,
    "originId" TEXT,
    "originName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOutput" (
    "id" TEXT NOT NULL,
    "productionJobId" TEXT NOT NULL,
    "productId" TEXT,
    "lotNo" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unitName" TEXT,
    "tankNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionOutput_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductionReactor_code_key" ON "ProductionReactor"("code");

-- CreateIndex
CREATE INDEX "ProductionPeriodSetting_year_week_idx" ON "ProductionPeriodSetting"("year", "week");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionPeriodSetting_year_week_key" ON "ProductionPeriodSetting"("year", "week");

-- CreateIndex
CREATE INDEX "ProductionRawMaterialOrigin_rawMaterialKey_idx" ON "ProductionRawMaterialOrigin"("rawMaterialKey");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionRawMaterialOrigin_rawMaterialKey_brandName_key" ON "ProductionRawMaterialOrigin"("rawMaterialKey", "brandName");

-- CreateIndex
CREATE INDEX "ProductionJob_year_week_idx" ON "ProductionJob"("year", "week");

-- CreateIndex
CREATE INDEX "ProductionJob_reactorId_idx" ON "ProductionJob"("reactorId");

-- CreateIndex
CREATE INDEX "ProductionJob_status_idx" ON "ProductionJob"("status");

-- CreateIndex
CREATE INDEX "ProductionJob_productId_idx" ON "ProductionJob"("productId");

-- CreateIndex
CREATE INDEX "ProductionJob_plannedStart_plannedEnd_idx" ON "ProductionJob"("plannedStart", "plannedEnd");

-- CreateIndex
CREATE INDEX "ProductionReactionRow_productionJobId_idx" ON "ProductionReactionRow"("productionJobId");

-- CreateIndex
CREATE INDEX "ProductionInput_productionJobId_idx" ON "ProductionInput"("productionJobId");

-- CreateIndex
CREATE INDEX "ProductionInput_productId_idx" ON "ProductionInput"("productId");

-- CreateIndex
CREATE INDEX "ProductionInput_rawMaterialReceiptItemId_idx" ON "ProductionInput"("rawMaterialReceiptItemId");

-- CreateIndex
CREATE INDEX "ProductionInput_rawMaterialName_idx" ON "ProductionInput"("rawMaterialName");

-- CreateIndex
CREATE INDEX "ProductionInput_lotNo_idx" ON "ProductionInput"("lotNo");

-- CreateIndex
CREATE INDEX "ProductionOutput_productionJobId_idx" ON "ProductionOutput"("productionJobId");

-- CreateIndex
CREATE INDEX "ProductionOutput_productId_idx" ON "ProductionOutput"("productId");

-- CreateIndex
CREATE INDEX "ProductionOutput_lotNo_idx" ON "ProductionOutput"("lotNo");

-- AddForeignKey
ALTER TABLE "ProductionJob" ADD CONSTRAINT "ProductionJob_reactorId_fkey" FOREIGN KEY ("reactorId") REFERENCES "ProductionReactor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionJob" ADD CONSTRAINT "ProductionJob_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionReactionRow" ADD CONSTRAINT "ProductionReactionRow_productionJobId_fkey" FOREIGN KEY ("productionJobId") REFERENCES "ProductionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInput" ADD CONSTRAINT "ProductionInput_productionJobId_fkey" FOREIGN KEY ("productionJobId") REFERENCES "ProductionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInput" ADD CONSTRAINT "ProductionInput_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInput" ADD CONSTRAINT "ProductionInput_rawMaterialReceiptItemId_fkey" FOREIGN KEY ("rawMaterialReceiptItemId") REFERENCES "RawMaterialReceiptItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutput" ADD CONSTRAINT "ProductionOutput_productionJobId_fkey" FOREIGN KEY ("productionJobId") REFERENCES "ProductionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutput" ADD CONSTRAINT "ProductionOutput_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
