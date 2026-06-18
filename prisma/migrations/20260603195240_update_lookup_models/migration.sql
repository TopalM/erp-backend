/*
  Warnings:

  - The primary key for the `TaxRatio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `label` on the `TaxRatio` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[scope,legacyId]` on the table `PaymentTerm` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[scope,name]` on the table `PaymentTerm` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `TaxRatio` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentTermScope" AS ENUM ('GENERAL', 'RAW_MATERIAL');

-- DropIndex
DROP INDEX "PaymentTerm_legacyId_key";

-- DropIndex
DROP INDEX "PaymentTerm_name_key";

-- AlterTable
ALTER TABLE "PaymentTerm" ADD COLUMN     "code" TEXT,
ADD COLUMN     "requiresDay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scope" "PaymentTermScope" NOT NULL DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "TaxRatio" DROP CONSTRAINT "TaxRatio_pkey",
DROP COLUMN "label",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "TaxRatio_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "PaymentTerm_scope_idx" ON "PaymentTerm"("scope");

-- CreateIndex
CREATE INDEX "PaymentTerm_isActive_idx" ON "PaymentTerm"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTerm_scope_legacyId_key" ON "PaymentTerm"("scope", "legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTerm_scope_name_key" ON "PaymentTerm"("scope", "name");
