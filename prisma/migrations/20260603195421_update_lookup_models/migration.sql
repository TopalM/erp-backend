-- CreateTable
CREATE TABLE "BloodType" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BloodType_legacyId_key" ON "BloodType"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "BloodType_name_key" ON "BloodType"("name");
