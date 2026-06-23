-- CreateTable
CREATE TABLE "Quality_Appearance" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quality_Appearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quality_InputControlAppearance" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quality_InputControlAppearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quality_RawMaterialAnalysisParameter" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "unit" TEXT,
    "cleaned" BOOLEAN NOT NULL DEFAULT false,
    "customSelect" BOOLEAN NOT NULL DEFAULT false,
    "lengthValue" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quality_RawMaterialAnalysisParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quality_RawMaterialAnalysisOption" (
    "id" INTEGER NOT NULL,
    "parameterId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quality_RawMaterialAnalysisOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quality_RawMaterialCategory" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quality_RawMaterialCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quality_RawMaterialType" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quality_RawMaterialType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quality_Appearance_name_key" ON "Quality_Appearance"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Quality_InputControlAppearance_name_key" ON "Quality_InputControlAppearance"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Quality_RawMaterialAnalysisParameter_fieldKey_key" ON "Quality_RawMaterialAnalysisParameter"("fieldKey");

-- CreateIndex
CREATE INDEX "Quality_RawMaterialAnalysisParameter_isActive_idx" ON "Quality_RawMaterialAnalysisParameter"("isActive");

-- CreateIndex
CREATE INDEX "Quality_RawMaterialAnalysisOption_parameterId_idx" ON "Quality_RawMaterialAnalysisOption"("parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "Quality_RawMaterialAnalysisOption_parameterId_value_key" ON "Quality_RawMaterialAnalysisOption"("parameterId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Quality_RawMaterialCategory_name_key" ON "Quality_RawMaterialCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Quality_RawMaterialType_name_key" ON "Quality_RawMaterialType"("name");

-- AddForeignKey
ALTER TABLE "Quality_RawMaterialAnalysisOption" ADD CONSTRAINT "Quality_RawMaterialAnalysisOption_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "Quality_RawMaterialAnalysisParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
