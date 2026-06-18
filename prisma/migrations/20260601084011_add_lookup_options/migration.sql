-- CreateEnum
CREATE TYPE "LookupOptionType" AS ENUM ('CURRENCY', 'DIFFERENT_VAT_RATIO', 'FAULT_TYPE', 'LOCATION', 'MACHINE_TYPE', 'PAYMENT_TERM', 'PLACE_OF_USE', 'PRODUCTION_YEAR', 'PURCHASED', 'SUPPLIER_POINT', 'TANK_FARM', 'TAX_RATIO', 'TRANSPORT');

-- CreateTable
CREATE TABLE "LookupOption" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "type" "LookupOptionType" NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "extra" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LookupOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LookupOption_type_idx" ON "LookupOption"("type");

-- CreateIndex
CREATE INDEX "LookupOption_isActive_idx" ON "LookupOption"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LookupOption_type_value_key" ON "LookupOption"("type", "value");

-- CreateIndex
CREATE UNIQUE INDEX "LookupOption_type_legacyId_key" ON "LookupOption"("type", "legacyId");
