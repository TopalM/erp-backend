/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `RawMaterialPriceRequestSupplier` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PriceRequestSupplierStatus" ADD VALUE 'RESPONDED';
ALTER TYPE "PriceRequestSupplierStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "RawMaterialPriceRecord" ADD COLUMN     "priceRequestSupplierId" TEXT;

-- AlterTable
ALTER TABLE "RawMaterialPriceRequestSupplier" ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "token" TEXT,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_priceRequestSupplierId_idx" ON "RawMaterialPriceRecord"("priceRequestSupplierId");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialPriceRequestSupplier_token_key" ON "RawMaterialPriceRequestSupplier"("token");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequestSupplier_token_idx" ON "RawMaterialPriceRequestSupplier"("token");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequestSupplier_tokenExpiresAt_idx" ON "RawMaterialPriceRequestSupplier"("tokenExpiresAt");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequestSupplier_respondedAt_idx" ON "RawMaterialPriceRequestSupplier"("respondedAt");

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRecord" ADD CONSTRAINT "RawMaterialPriceRecord_priceRequestSupplierId_fkey" FOREIGN KEY ("priceRequestSupplierId") REFERENCES "RawMaterialPriceRequestSupplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
