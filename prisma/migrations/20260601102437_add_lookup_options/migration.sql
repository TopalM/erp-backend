-- AlterTable
ALTER TABLE "sub_machines" ADD COLUMN     "isScrap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scrapDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "sub_machines_isScrap_idx" ON "sub_machines"("isScrap");
