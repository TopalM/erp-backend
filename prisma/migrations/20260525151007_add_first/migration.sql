-- CreateTable
CREATE TABLE "cities" (
    "id" INTEGER NOT NULL,
    "countryId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subregions" (
    "id" INTEGER NOT NULL,
    "countryId" INTEGER NOT NULL,
    "subregion" TEXT NOT NULL,

    CONSTRAINT "subregions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_offices" (
    "id" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "tax_offices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cities_countryId_idx" ON "cities"("countryId");

-- CreateIndex
CREATE INDEX "districts_cityId_idx" ON "districts"("cityId");

-- CreateIndex
CREATE INDEX "subregions_countryId_idx" ON "subregions"("countryId");

-- CreateIndex
CREATE INDEX "tax_offices_cityId_idx" ON "tax_offices"("cityId");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subregions" ADD CONSTRAINT "subregions_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_offices" ADD CONSTRAINT "tax_offices_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
