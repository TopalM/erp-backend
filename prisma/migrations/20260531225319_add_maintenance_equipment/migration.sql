-- CreateTable
CREATE TABLE "fault_maintenances" (
    "id" SERIAL NOT NULL,
    "requester" TEXT,
    "savedBy" TEXT,
    "revisedBy" TEXT,
    "revisedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "mainMachineId" INTEGER NOT NULL,
    "subMachineId" INTEGER,
    "supplierId" TEXT,
    "description" TEXT NOT NULL,
    "endOfWorkDescription" TEXT,
    "faultType" TEXT,
    "reasonFailure" TEXT,
    "workingPersonel" TEXT,
    "materials" TEXT,
    "quantities" TEXT,
    "unitPrices" TEXT,
    "totalPrices" TEXT,
    "totalPriceWithMaterialAndWorking" DECIMAL(18,2),
    "workStartDateTime" TIMESTAMP(3),
    "workEndDateTime" TIMESTAMP(3),
    "status" INTEGER NOT NULL DEFAULT 0,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "fault_maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_trade_marks" (
    "id" SERIAL NOT NULL,
    "tradeMark" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "machine_trade_marks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main_machines" (
    "id" SERIAL NOT NULL,
    "mainMachineCode" TEXT,
    "mainMachineName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "commissioningDate" TIMESTAMP(3),
    "tradeMarkId" INTEGER,
    "model" TEXT,
    "productionYear" TEXT,
    "machineType" TEXT,
    "isExproof" BOOLEAN NOT NULL DEFAULT false,
    "hasSubMachine" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(18,2),
    "currency" TEXT,
    "isScrap" BOOLEAN NOT NULL DEFAULT false,
    "scrapDate" TIMESTAMP(3),
    "lastMaintenanceDate" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "main_machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodic_maintenances" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "mainMachineId" INTEGER NOT NULL,
    "subMachineId" INTEGER,
    "supplierId" TEXT,
    "periodicMaintenanceInvoiceDate" TIMESTAMP(3) NOT NULL,
    "firstPeriodicMaintenanceDate" TIMESTAMP(3),
    "periodicMaintenanceInvoiceImage" TEXT,
    "invoicePrice" DECIMAL(18,2),
    "currency" TEXT,
    "annualPlanned" TEXT,
    "whichMaintenance" INTEGER NOT NULL DEFAULT 1,
    "scheduledMaintenanceDates" TEXT,
    "actualMaintenanceDates" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "periodic_maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_machines" (
    "id" SERIAL NOT NULL,
    "subMachineCode" TEXT,
    "subMachineName" TEXT NOT NULL,
    "mainMachineId" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "commissioningDate" TIMESTAMP(3),
    "tradeMarkId" INTEGER,
    "model" TEXT,
    "productionYear" TEXT,
    "machineType" TEXT,
    "isExproof" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(18,2),
    "currency" TEXT,
    "lastMaintenanceDate" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "sub_machines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fault_maintenances_mainMachineId_idx" ON "fault_maintenances"("mainMachineId");

-- CreateIndex
CREATE INDEX "fault_maintenances_subMachineId_idx" ON "fault_maintenances"("subMachineId");

-- CreateIndex
CREATE INDEX "fault_maintenances_supplierId_idx" ON "fault_maintenances"("supplierId");

-- CreateIndex
CREATE INDEX "fault_maintenances_location_idx" ON "fault_maintenances"("location");

-- CreateIndex
CREATE INDEX "fault_maintenances_status_idx" ON "fault_maintenances"("status");

-- CreateIndex
CREATE UNIQUE INDEX "machine_trade_marks_tradeMark_key" ON "machine_trade_marks"("tradeMark");

-- CreateIndex
CREATE INDEX "machine_trade_marks_tradeMark_idx" ON "machine_trade_marks"("tradeMark");

-- CreateIndex
CREATE UNIQUE INDEX "main_machines_mainMachineCode_key" ON "main_machines"("mainMachineCode");

-- CreateIndex
CREATE INDEX "main_machines_mainMachineName_idx" ON "main_machines"("mainMachineName");

-- CreateIndex
CREATE INDEX "main_machines_location_idx" ON "main_machines"("location");

-- CreateIndex
CREATE INDEX "main_machines_tradeMarkId_idx" ON "main_machines"("tradeMarkId");

-- CreateIndex
CREATE INDEX "main_machines_isScrap_idx" ON "main_machines"("isScrap");

-- CreateIndex
CREATE INDEX "main_machines_deletedAt_idx" ON "main_machines"("deletedAt");

-- CreateIndex
CREATE INDEX "periodic_maintenances_mainMachineId_idx" ON "periodic_maintenances"("mainMachineId");

-- CreateIndex
CREATE INDEX "periodic_maintenances_subMachineId_idx" ON "periodic_maintenances"("subMachineId");

-- CreateIndex
CREATE INDEX "periodic_maintenances_supplierId_idx" ON "periodic_maintenances"("supplierId");

-- CreateIndex
CREATE INDEX "periodic_maintenances_location_idx" ON "periodic_maintenances"("location");

-- CreateIndex
CREATE UNIQUE INDEX "sub_machines_subMachineCode_key" ON "sub_machines"("subMachineCode");

-- CreateIndex
CREATE INDEX "sub_machines_subMachineName_idx" ON "sub_machines"("subMachineName");

-- CreateIndex
CREATE INDEX "sub_machines_mainMachineId_idx" ON "sub_machines"("mainMachineId");

-- CreateIndex
CREATE INDEX "sub_machines_location_idx" ON "sub_machines"("location");

-- CreateIndex
CREATE INDEX "sub_machines_tradeMarkId_idx" ON "sub_machines"("tradeMarkId");

-- CreateIndex
CREATE INDEX "sub_machines_deletedAt_idx" ON "sub_machines"("deletedAt");

-- AddForeignKey
ALTER TABLE "fault_maintenances" ADD CONSTRAINT "fault_maintenances_mainMachineId_fkey" FOREIGN KEY ("mainMachineId") REFERENCES "main_machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fault_maintenances" ADD CONSTRAINT "fault_maintenances_subMachineId_fkey" FOREIGN KEY ("subMachineId") REFERENCES "sub_machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fault_maintenances" ADD CONSTRAINT "fault_maintenances_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main_machines" ADD CONSTRAINT "main_machines_tradeMarkId_fkey" FOREIGN KEY ("tradeMarkId") REFERENCES "machine_trade_marks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodic_maintenances" ADD CONSTRAINT "periodic_maintenances_mainMachineId_fkey" FOREIGN KEY ("mainMachineId") REFERENCES "main_machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodic_maintenances" ADD CONSTRAINT "periodic_maintenances_subMachineId_fkey" FOREIGN KEY ("subMachineId") REFERENCES "sub_machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodic_maintenances" ADD CONSTRAINT "periodic_maintenances_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_machines" ADD CONSTRAINT "sub_machines_mainMachineId_fkey" FOREIGN KEY ("mainMachineId") REFERENCES "main_machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_machines" ADD CONSTRAINT "sub_machines_tradeMarkId_fkey" FOREIGN KEY ("tradeMarkId") REFERENCES "machine_trade_marks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
