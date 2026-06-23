-- AlterTable
ALTER TABLE "Production_Reactor" ALTER COLUMN "sortOrder" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Production_Reactor_code_idx" ON "Production_Reactor"("code");
