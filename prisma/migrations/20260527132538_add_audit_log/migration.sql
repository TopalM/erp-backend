-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "orderDate" SET DATA TYPE DATE,
ALTER COLUMN "deliveryDate" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "RawMaterialPriceRecord" ALTER COLUMN "priceDate" SET DATA TYPE DATE,
ALTER COLUMN "validUntil" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "RawMaterialReceipt" ALTER COLUMN "receiptDate" SET DATA TYPE DATE;
