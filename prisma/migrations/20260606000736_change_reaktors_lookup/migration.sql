/*
  Warnings:

  - You are about to drop the column `cityId` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `countryId` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `districtId` on the `Supplier` table. All the data in the column will be lost.
  - Added the required column `city` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_cityId_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_districtId_fkey";

-- DropIndex
DROP INDEX "Supplier_cityId_idx";

-- DropIndex
DROP INDEX "Supplier_countryId_idx";

-- DropIndex
DROP INDEX "Supplier_districtId_idx";

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "cityId",
DROP COLUMN "countryId",
DROP COLUMN "districtId",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Turkey',
ADD COLUMN     "district" TEXT;

-- CreateIndex
CREATE INDEX "Supplier_country_idx" ON "Supplier"("country");

-- CreateIndex
CREATE INDEX "Supplier_city_idx" ON "Supplier"("city");

-- CreateIndex
CREATE INDEX "Supplier_district_idx" ON "Supplier"("district");
