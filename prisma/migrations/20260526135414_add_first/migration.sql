-- AlterTable
ALTER TABLE "RawMaterialPriceRecord" ADD COLUMN     "deliveryDay" INTEGER,
ADD COLUMN     "paymentTerm" TEXT;

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_paymentTerm_idx" ON "RawMaterialPriceRecord"("paymentTerm");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_deliveryDay_idx" ON "RawMaterialPriceRecord"("deliveryDay");
