-- CreateTable
CREATE TABLE "endexes" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fctryMainNtrlGasDgtl" DECIMAL(18,2) NOT NULL,
    "fctryMainNtrlGasMnl" DECIMAL(18,2) NOT NULL,
    "plstfyMainNtrlGasDgtl" DECIMAL(18,2) NOT NULL,
    "plstfyMainNtrlGasMnl" DECIMAL(18,2) NOT NULL,
    "kobeMainNtrlGasDgtl" DECIMAL(18,2) NOT NULL,
    "kobeMainNaturalGasManual" DECIMAL(18,2) NOT NULL,
    "kobeHotWtrNtrlGasDgtl" DECIMAL(18,2) NOT NULL,
    "kobeHotWtrNtrlGasMnl" DECIMAL(18,2) NOT NULL,
    "plstfyMainWtr" DECIMAL(18,2) NOT NULL,
    "fctryGardenWtr" DECIMAL(18,2) NOT NULL,
    "plstfyProcessWtr" DECIMAL(18,2) NOT NULL,
    "kobeMainWtr" DECIMAL(18,2) NOT NULL,
    "kobeWasteWtr" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "endexes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "endexes_date_key" ON "endexes"("date");

-- CreateIndex
CREATE INDEX "endexes_date_idx" ON "endexes"("date");

-- CreateIndex
CREATE INDEX "endexes_deletedAt_idx" ON "endexes"("deletedAt");
