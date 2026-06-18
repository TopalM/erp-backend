/*
  Warnings:

  - You are about to drop the column `bg` on the `ProductionReactor` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `ProductionReactor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductionReactor" DROP COLUMN "bg",
DROP COLUMN "color";

-- CreateIndex
CREATE INDEX "ProductionJob_type_idx" ON "ProductionJob"("type");

-- CreateIndex
CREATE INDEX "ProductionJob_isDeleted_idx" ON "ProductionJob"("isDeleted");
