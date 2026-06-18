-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'PASSIVE', 'RESIGNED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "SupplierCategoryType" AS ENUM ('RAW_MATERIAL', 'MATERIAL', 'SERVICE');

-- CreateEnum
CREATE TYPE "SupplierEvaluationType" AS ENUM ('QUALITY', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "SupplierContactType" AS ENUM ('MAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "PriceRequestChannel" AS ENUM ('MAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "PriceRequestSupplierStatus" AS ENUM ('DRAFT', 'READY', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "PriceRecordSource" AS ENUM ('MANUAL', 'WHATSAPP', 'MAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'ORDERED', 'SENT_TO_IMPORT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchaseOrderType" AS ENUM ('DOMESTIC', 'IMPORT');

-- CreateEnum
CREATE TYPE "RawMaterialReceiptStatus" AS ENUM ('DRAFT', 'RECEIVED', 'QC_PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "departmentId" TEXT,
    "roleId" TEXT NOT NULL,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "phone" TEXT,
    "profilePhotoUrl" TEXT,
    "preferredTheme" TEXT DEFAULT 'light',
    "emailVerifiedAt" TIMESTAMP(3),
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthEventLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "event" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthEventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "employeeNo" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "identityNo" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "title" TEXT,
    "department" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "userId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "district" TEXT,
    "city" TEXT,
    "country" TEXT,
    "taxOffice" TEXT,
    "taxNumber" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,
    "qualityAverageScore" DECIMAL(8,2),
    "commercialAverageScore" DECIMAL(8,2),
    "overallAverageScore" DECIMAL(8,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierCategory" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "type" "SupplierCategoryType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierContact" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SupplierContactType" NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierRawMaterial" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "productId" TEXT,
    "rawMaterialName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierRawMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierDocumentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierDocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierDocument" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierEvaluation" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "evaluationType" "SupplierEvaluationType" NOT NULL,
    "score" DECIMAL(8,2) NOT NULL,
    "comment" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialPriceRecord" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "productId" TEXT,
    "rawMaterialName" TEXT NOT NULL,
    "price" DECIMAL(18,4) NOT NULL,
    "previousPrice" DECIMAL(18,4),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "unit" TEXT NOT NULL DEFAULT 'ton',
    "priceDate" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "source" "PriceRecordSource" NOT NULL DEFAULT 'MANUAL',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialPriceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialPriceRequestDraft" (
    "id" TEXT NOT NULL,
    "channel" "PriceRequestChannel" NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialPriceRequestDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialPriceRequest" (
    "id" TEXT NOT NULL,
    "draftId" TEXT,
    "rawMaterialName" TEXT,
    "productId" TEXT,
    "channel" "PriceRequestChannel" NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawMaterialPriceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialPriceRequestSupplier" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "contactId" TEXT,
    "channel" "PriceRequestChannel" NOT NULL,
    "status" "PriceRequestSupplierStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialPriceRequestSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialWhatsAppSettings" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sendMode" TEXT NOT NULL DEFAULT 'manual',
    "defaultCountryCode" TEXT NOT NULL DEFAULT '90',
    "defaultMessage" TEXT NOT NULL,
    "addProductName" BOOLEAN NOT NULL DEFAULT true,
    "addPaymentTerm" BOOLEAN NOT NULL DEFAULT true,
    "addDeliveryTerm" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialWhatsAppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "orderType" "PurchaseOrderType" NOT NULL DEFAULT 'DOMESTIC',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "productId" TEXT,
    "priceRecordId" TEXT,
    "rawMaterialName" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'ton',
    "unitPrice" DECIMAL(18,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialReceipt" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "receiptNo" TEXT NOT NULL,
    "receiptDate" TIMESTAMP(3) NOT NULL,
    "supplierBatchNo" TEXT,
    "documentNo" TEXT,
    "status" "RawMaterialReceiptStatus" NOT NULL DEFAULT 'RECEIVED',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RawMaterialReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialReceiptItem" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "productId" TEXT,
    "rawMaterialName" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'ton',
    "lotNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawMaterialReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeNo_key" ON "Employee"("employeeNo");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_identityNo_key" ON "Employee"("identityNo");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE INDEX "Employee_status_idx" ON "Employee"("status");

-- CreateIndex
CREATE INDEX "Employee_deletedAt_idx" ON "Employee"("deletedAt");

-- CreateIndex
CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");

-- CreateIndex
CREATE INDEX "Supplier_isActive_idx" ON "Supplier"("isActive");

-- CreateIndex
CREATE INDEX "Supplier_deletedAt_idx" ON "Supplier"("deletedAt");

-- CreateIndex
CREATE INDEX "SupplierCategory_type_idx" ON "SupplierCategory"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierCategory_supplierId_type_key" ON "SupplierCategory"("supplierId", "type");

-- CreateIndex
CREATE INDEX "SupplierContact_supplierId_idx" ON "SupplierContact"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierContact_type_idx" ON "SupplierContact"("type");

-- CreateIndex
CREATE INDEX "SupplierRawMaterial_supplierId_idx" ON "SupplierRawMaterial"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierRawMaterial_productId_idx" ON "SupplierRawMaterial"("productId");

-- CreateIndex
CREATE INDEX "SupplierRawMaterial_rawMaterialName_idx" ON "SupplierRawMaterial"("rawMaterialName");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierRawMaterial_supplierId_rawMaterialName_key" ON "SupplierRawMaterial"("supplierId", "rawMaterialName");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierDocumentType_name_key" ON "SupplierDocumentType"("name");

-- CreateIndex
CREATE INDEX "SupplierDocument_supplierId_idx" ON "SupplierDocument"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierDocument_documentTypeId_idx" ON "SupplierDocument"("documentTypeId");

-- CreateIndex
CREATE INDEX "SupplierDocument_expiryDate_idx" ON "SupplierDocument"("expiryDate");

-- CreateIndex
CREATE INDEX "SupplierEvaluation_supplierId_idx" ON "SupplierEvaluation"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierEvaluation_evaluationType_idx" ON "SupplierEvaluation"("evaluationType");

-- CreateIndex
CREATE INDEX "SupplierEvaluation_createdAt_idx" ON "SupplierEvaluation"("createdAt");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_supplierId_idx" ON "RawMaterialPriceRecord"("supplierId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_productId_idx" ON "RawMaterialPriceRecord"("productId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_rawMaterialName_idx" ON "RawMaterialPriceRecord"("rawMaterialName");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_priceDate_idx" ON "RawMaterialPriceRecord"("priceDate");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_validUntil_idx" ON "RawMaterialPriceRecord"("validUntil");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRecord_source_idx" ON "RawMaterialPriceRecord"("source");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequestDraft_channel_idx" ON "RawMaterialPriceRequestDraft"("channel");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequestDraft_isActive_idx" ON "RawMaterialPriceRequestDraft"("isActive");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequest_draftId_idx" ON "RawMaterialPriceRequest"("draftId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequest_productId_idx" ON "RawMaterialPriceRequest"("productId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequest_rawMaterialName_idx" ON "RawMaterialPriceRequest"("rawMaterialName");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequest_requestedAt_idx" ON "RawMaterialPriceRequest"("requestedAt");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequestSupplier_requestId_idx" ON "RawMaterialPriceRequestSupplier"("requestId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequestSupplier_supplierId_idx" ON "RawMaterialPriceRequestSupplier"("supplierId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequestSupplier_contactId_idx" ON "RawMaterialPriceRequestSupplier"("contactId");

-- CreateIndex
CREATE INDEX "RawMaterialPriceRequestSupplier_status_idx" ON "RawMaterialPriceRequestSupplier"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialPriceRequestSupplier_requestId_supplierId_key" ON "RawMaterialPriceRequestSupplier"("requestId", "supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_orderNo_key" ON "PurchaseOrder"("orderNo");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_orderDate_idx" ON "PurchaseOrder"("orderDate");

-- CreateIndex
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");

-- CreateIndex
CREATE INDEX "PurchaseOrder_orderType_idx" ON "PurchaseOrder"("orderType");

-- CreateIndex
CREATE INDEX "PurchaseOrder_deletedAt_idx" ON "PurchaseOrder"("deletedAt");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_purchaseOrderId_idx" ON "PurchaseOrderItem"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_productId_idx" ON "PurchaseOrderItem"("productId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_priceRecordId_idx" ON "PurchaseOrderItem"("priceRecordId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_rawMaterialName_idx" ON "PurchaseOrderItem"("rawMaterialName");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialReceipt_receiptNo_key" ON "RawMaterialReceipt"("receiptNo");

-- CreateIndex
CREATE INDEX "RawMaterialReceipt_supplierId_idx" ON "RawMaterialReceipt"("supplierId");

-- CreateIndex
CREATE INDEX "RawMaterialReceipt_purchaseOrderId_idx" ON "RawMaterialReceipt"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "RawMaterialReceipt_receiptDate_idx" ON "RawMaterialReceipt"("receiptDate");

-- CreateIndex
CREATE INDEX "RawMaterialReceipt_status_idx" ON "RawMaterialReceipt"("status");

-- CreateIndex
CREATE INDEX "RawMaterialReceipt_deletedAt_idx" ON "RawMaterialReceipt"("deletedAt");

-- CreateIndex
CREATE INDEX "RawMaterialReceiptItem_receiptId_idx" ON "RawMaterialReceiptItem"("receiptId");

-- CreateIndex
CREATE INDEX "RawMaterialReceiptItem_productId_idx" ON "RawMaterialReceiptItem"("productId");

-- CreateIndex
CREATE INDEX "RawMaterialReceiptItem_rawMaterialName_idx" ON "RawMaterialReceiptItem"("rawMaterialName");

-- CreateIndex
CREATE INDEX "RawMaterialReceiptItem_lotNo_idx" ON "RawMaterialReceiptItem"("lotNo");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthEventLog" ADD CONSTRAINT "AuthEventLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierCategory" ADD CONSTRAINT "SupplierCategory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierContact" ADD CONSTRAINT "SupplierContact_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierRawMaterial" ADD CONSTRAINT "SupplierRawMaterial_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierRawMaterial" ADD CONSTRAINT "SupplierRawMaterial_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierDocument" ADD CONSTRAINT "SupplierDocument_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierDocument" ADD CONSTRAINT "SupplierDocument_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "SupplierDocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierEvaluation" ADD CONSTRAINT "SupplierEvaluation_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierEvaluation" ADD CONSTRAINT "SupplierEvaluation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRecord" ADD CONSTRAINT "RawMaterialPriceRecord_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRecord" ADD CONSTRAINT "RawMaterialPriceRecord_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRequest" ADD CONSTRAINT "RawMaterialPriceRequest_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "RawMaterialPriceRequestDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRequest" ADD CONSTRAINT "RawMaterialPriceRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRequestSupplier" ADD CONSTRAINT "RawMaterialPriceRequestSupplier_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RawMaterialPriceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRequestSupplier" ADD CONSTRAINT "RawMaterialPriceRequestSupplier_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPriceRequestSupplier" ADD CONSTRAINT "RawMaterialPriceRequestSupplier_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "SupplierContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_priceRecordId_fkey" FOREIGN KEY ("priceRecordId") REFERENCES "RawMaterialPriceRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialReceipt" ADD CONSTRAINT "RawMaterialReceipt_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialReceipt" ADD CONSTRAINT "RawMaterialReceipt_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialReceiptItem" ADD CONSTRAINT "RawMaterialReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "RawMaterialReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialReceiptItem" ADD CONSTRAINT "RawMaterialReceiptItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
