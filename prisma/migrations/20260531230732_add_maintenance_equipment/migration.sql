-- CreateTable
CREATE TABLE "personels" (
    "id" SERIAL NOT NULL,
    "registrationNumber" TEXT,
    "nameSurname" TEXT NOT NULL,
    "department" TEXT,
    "location" TEXT,
    "telNumber" TEXT,
    "emergencyTelNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "birthPlace" TEXT,
    "dateOfEmployment" TIMESTAMP(3),
    "bloodType" TEXT,
    "address" TEXT,
    "district" TEXT,
    "city" TEXT,
    "remainVacation" DECIMAL(8,2) DEFAULT 14,
    "remainOtherVacation" DECIMAL(8,2) DEFAULT 0,
    "isMechanicalPersonel" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "personels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personels_nameSurname_idx" ON "personels"("nameSurname");

-- CreateIndex
CREATE INDEX "personels_registrationNumber_idx" ON "personels"("registrationNumber");

-- CreateIndex
CREATE INDEX "personels_department_idx" ON "personels"("department");

-- CreateIndex
CREATE INDEX "personels_location_idx" ON "personels"("location");

-- CreateIndex
CREATE INDEX "personels_deletedAt_idx" ON "personels"("deletedAt");
