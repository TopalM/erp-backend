/*
  Warnings:

  - You are about to drop the `RawMaterialWhatsAppSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PurchaseMessageLanguage" AS ENUM ('TR', 'EN');

-- CreateEnum
CREATE TYPE "PurchaseSendMode" AS ENUM ('manual', 'draft', 'backend');

-- DropTable
DROP TABLE "RawMaterialWhatsAppSettings";

-- CreateTable
CREATE TABLE "RawMaterialPurchaseSettings" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "messageLanguage" "PurchaseMessageLanguage" NOT NULL DEFAULT 'EN',
    "sendMode" "PurchaseSendMode" NOT NULL DEFAULT 'manual',
    "defaultCountryCode" TEXT NOT NULL DEFAULT '90',
    "mailSubjectTr" TEXT,
    "mailSubjectEn" TEXT,
    "messageTr" TEXT NOT NULL,
    "messageEn" TEXT NOT NULL,
    "addProductName" BOOLEAN NOT NULL DEFAULT true,
    "addPaymentTerm" BOOLEAN NOT NULL DEFAULT true,
    "addDeliveryTerm" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialPurchaseSettings_pkey" PRIMARY KEY ("id")
);
