/*
  Warnings:

  - You are about to drop the column `deliveryDay` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `paymentTerm` on the `Supplier` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "deliveryDay",
DROP COLUMN "paymentTerm";
