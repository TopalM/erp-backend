-- CreateEnum
CREATE TYPE "PermissionEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateEnum
CREATE TYPE "PaymentTermScope" AS ENUM ('GENERAL', 'RAW_MATERIAL');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'PASSIVE', 'RESIGNED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('BLUE_COLLAR', 'WHITE_COLLAR');

-- CreateEnum
CREATE TYPE "ApprovalModule" AS ENUM ('PURCHASING', 'SUPPLIER', 'QUALITY', 'PRODUCTION', 'SHIPMENT', 'MAINTENANCE', 'SALES', 'IMPORT', 'UTILITY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ApprovalEntityType" AS ENUM ('PURCHASE_REQUEST', 'PURCHASE_QUOTATION', 'PURCHASE_ORDER', 'PURCHASE_RECEIPT', 'SUPPLIER', 'SUPPLIER_DOCUMENT', 'QUALITY_INSPECTION', 'QUALITY_DEVIATION', 'QUALITY_CERTIFICATE', 'PRODUCTION_ORDER', 'PRODUCTION_BATCH', 'SHIPMENT_PLAN', 'DISPATCH_NOTE', 'MAINTENANCE', 'EQUIPMENT', 'SALES_ORDER', 'SALES_DISCOUNT', 'IMPORT_REQUEST', 'UTILITY_READING', 'OTHER');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentModule" AS ENUM ('PURCHASING', 'SUPPLIER', 'QUALITY', 'PRODUCTION', 'SHIPMENT', 'MAINTENANCE', 'SALES', 'IMPORT', 'UTILITY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AssignmentEntityType" AS ENUM ('PURCHASE_REQUEST', 'PURCHASE_QUOTATION', 'PURCHASE_ORDER', 'PURCHASE_RECEIPT', 'SUPPLIER', 'SUPPLIER_DOCUMENT', 'QUALITY_INSPECTION', 'QUALITY_CERTIFICATE', 'QUALITY_DEVIATION', 'PRODUCTION_ORDER', 'PRODUCTION_BATCH', 'SHIPMENT_PLAN', 'DISPATCH_NOTE', 'MAINTENANCE', 'EQUIPMENT', 'SALES_ORDER', 'SALES_DISCOUNT', 'IMPORT_REQUEST', 'UTILITY_READING', 'OTHER');

-- CreateEnum
CREATE TYPE "AssignmentRole" AS ENUM ('RESPONSIBLE', 'VIEWER', 'APPROVER', 'REQUESTER', 'OWNER', 'FOLLOWER');

-- CreateEnum
CREATE TYPE "AuditModule" AS ENUM ('AUTH', 'USER', 'ROLE', 'PERMISSION', 'SUPPLIER', 'PRODUCT', 'PURCHASE', 'RAW_MATERIAL_RECEIPT', 'QUALITY', 'MAINTENANCE', 'PRODUCTION', 'STORAGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'UPLOAD', 'DOWNLOAD', 'USER_ACTIVATED', 'USER_DEACTIVATED', 'USER_ROLE_UPDATED', 'USER_DEPARTMENT_UPDATED', 'USER_FORCE_LOGOUT', 'ERROR');

-- CreateEnum
CREATE TYPE "AuthEventType" AS ENUM ('REGISTER_SUCCESS', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'ACCOUNT_LOCKED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'PASSWORD_CHANGED', 'EMAIL_VERIFICATION_SENT', 'EMAIL_VERIFICATION_FAILED', 'EMAIL_VERIFIED');

-- CreateEnum
CREATE TYPE "DocumentModule" AS ENUM ('PURCHASING', 'SUPPLIER', 'QUALITY', 'PRODUCTION', 'SHIPMENT', 'MAINTENANCE', 'EMPLOYEE', 'ACCOUNTING', 'UTILITY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DocumentEntityType" AS ENUM ('PURCHASE_REQUEST', 'PURCHASE_QUOTATION', 'PURCHASE_ORDER', 'PURCHASE_RECEIPT', 'VENDOR_INVOICE', 'SUPPLIER', 'SUPPLIER_DOCUMENT', 'QUALITY_INSPECTION', 'QUALITY_CERTIFICATE', 'QUALITY_DEVIATION', 'PRODUCTION_ORDER', 'PRODUCTION_BATCH', 'SHIPMENT_PLAN', 'DISPATCH_NOTE', 'MAINTENANCE', 'EQUIPMENT', 'EMPLOYEE', 'UTILITY_READING', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('QUOTATION', 'PURCHASE_FORM', 'DELIVERY_NOTE', 'RECEIPT_DOCUMENT', 'INVOICE', 'ISO_9001', 'ISO_14001', 'ISO_45001', 'ISO_50001', 'COA', 'SDS', 'TDS', 'ANALYSIS_REPORT', 'PACKING_LIST', 'MAINTENANCE_FORM', 'EMPLOYEE_DOCUMENT', 'UTILITY_REPORT', 'OTHER');

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
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "effect" "PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Lookup_BloodType" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_BloodType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_Country" (
    "id" INTEGER NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "iso2" VARCHAR(2) NOT NULL,
    "phoneCode" VARCHAR(10) NOT NULL,

    CONSTRAINT "Lookup_Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_City" (
    "id" INTEGER NOT NULL,
    "countryId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Lookup_City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_District" (
    "id" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Lookup_District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_SubRegion" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "countryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_SubRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_TaxOffice" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "cityId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_TaxOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_Currency" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_Unit" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_FaultType" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_FaultType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_Location" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_MachineType" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_MachineType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_PaymentTerm" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "scope" "PaymentTermScope" NOT NULL DEFAULT 'GENERAL',
    "code" TEXT,
    "name" TEXT NOT NULL,
    "days" INTEGER,
    "requiresDay" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_PaymentTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_PlaceOfUse" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_PlaceOfUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_ProductionYear" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "year" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_ProductionYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_Purchased" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_Purchased_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_PurchaseReason" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_PurchaseReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_ReasonFailure" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_ReasonFailure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_SupplierPoint" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "value" INTEGER NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_SupplierPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_TankFarm" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_TankFarm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_TaxRatio" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "value" DECIMAL(5,2) NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_TaxRatio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lookup_TransportType" (
    "id" TEXT NOT NULL,
    "legacyId" INTEGER,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_TransportType_pkey" PRIMARY KEY ("id")
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
    "employeeCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "type" "EmployeeType" NOT NULL DEFAULT 'BLUE_COLLAR',
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "phone" TEXT,
    "email" TEXT,
    "identityNumber" TEXT,
    "birthDate" TIMESTAMP(3),
    "hireDate" TIMESTAMP(3),
    "leaveDate" TIMESTAMP(3),
    "title" TEXT,
    "departmentId" TEXT,
    "userId" TEXT,
    "bloodTypeId" TEXT,
    "locationId" TEXT,
    "cityId" INTEGER,
    "districtId" INTEGER,
    "address" TEXT,
    "monthlySalary" DECIMAL(12,2),
    "salaryCurrency" TEXT DEFAULT 'TRY',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "module" "ApprovalModule" NOT NULL,
    "entityType" "ApprovalEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT,
    "approverId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "module" "AssignmentModule" NOT NULL,
    "entityType" "AssignmentEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "AssignmentRole" NOT NULL DEFAULT 'RESPONSIBLE',
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorEmail" TEXT,
    "entityType" "AuditModule" NOT NULL,
    "entityId" TEXT,
    "action" "AuditAction" NOT NULL,
    "message" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthEventLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "event" "AuthEventType" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthEventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "module" "DocumentModule" NOT NULL,
    "entityType" "DocumentEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "title" TEXT,
    "description" TEXT,
    "originalFileName" TEXT NOT NULL,
    "storedFileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileExtension" TEXT,
    "sizeBytes" INTEGER,
    "storageProvider" TEXT,
    "uploadedById" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "UserPermission_userId_idx" ON "UserPermission"("userId");

-- CreateIndex
CREATE INDEX "UserPermission_permissionId_idx" ON "UserPermission"("permissionId");

-- CreateIndex
CREATE INDEX "UserPermission_effect_idx" ON "UserPermission"("effect");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_permissionId_key" ON "UserPermission"("userId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_BloodType_legacyId_key" ON "Lookup_BloodType"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_BloodType_name_key" ON "Lookup_BloodType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_Country_iso2_key" ON "Lookup_Country"("iso2");

-- CreateIndex
CREATE INDEX "Lookup_Country_value_idx" ON "Lookup_Country"("value");

-- CreateIndex
CREATE INDEX "Lookup_City_countryId_idx" ON "Lookup_City"("countryId");

-- CreateIndex
CREATE INDEX "Lookup_District_cityId_idx" ON "Lookup_District"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_SubRegion_legacyId_key" ON "Lookup_SubRegion"("legacyId");

-- CreateIndex
CREATE INDEX "Lookup_SubRegion_countryId_idx" ON "Lookup_SubRegion"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_SubRegion_countryId_name_key" ON "Lookup_SubRegion"("countryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_TaxOffice_legacyId_key" ON "Lookup_TaxOffice"("legacyId");

-- CreateIndex
CREATE INDEX "Lookup_TaxOffice_cityId_idx" ON "Lookup_TaxOffice"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_TaxOffice_cityId_name_key" ON "Lookup_TaxOffice"("cityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_Currency_legacyId_key" ON "Lookup_Currency"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_Currency_code_key" ON "Lookup_Currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_Unit_code_key" ON "Lookup_Unit"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_Unit_name_key" ON "Lookup_Unit"("name");

-- CreateIndex
CREATE INDEX "Lookup_Unit_code_idx" ON "Lookup_Unit"("code");

-- CreateIndex
CREATE INDEX "Lookup_Unit_name_idx" ON "Lookup_Unit"("name");

-- CreateIndex
CREATE INDEX "Lookup_Unit_isActive_idx" ON "Lookup_Unit"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_FaultType_legacyId_key" ON "Lookup_FaultType"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_FaultType_name_key" ON "Lookup_FaultType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_Location_legacyId_key" ON "Lookup_Location"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_Location_name_key" ON "Lookup_Location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_MachineType_legacyId_key" ON "Lookup_MachineType"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_MachineType_name_key" ON "Lookup_MachineType"("name");

-- CreateIndex
CREATE INDEX "Lookup_PaymentTerm_scope_idx" ON "Lookup_PaymentTerm"("scope");

-- CreateIndex
CREATE INDEX "Lookup_PaymentTerm_isActive_idx" ON "Lookup_PaymentTerm"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_PaymentTerm_scope_legacyId_key" ON "Lookup_PaymentTerm"("scope", "legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_PaymentTerm_scope_name_key" ON "Lookup_PaymentTerm"("scope", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_PlaceOfUse_legacyId_key" ON "Lookup_PlaceOfUse"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_PlaceOfUse_name_key" ON "Lookup_PlaceOfUse"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_ProductionYear_legacyId_key" ON "Lookup_ProductionYear"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_ProductionYear_year_key" ON "Lookup_ProductionYear"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_Purchased_legacyId_key" ON "Lookup_Purchased"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_Purchased_name_key" ON "Lookup_Purchased"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_PurchaseReason_legacyId_key" ON "Lookup_PurchaseReason"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_PurchaseReason_name_key" ON "Lookup_PurchaseReason"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_ReasonFailure_legacyId_key" ON "Lookup_ReasonFailure"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_ReasonFailure_name_key" ON "Lookup_ReasonFailure"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_SupplierPoint_legacyId_key" ON "Lookup_SupplierPoint"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_SupplierPoint_value_key" ON "Lookup_SupplierPoint"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_TankFarm_legacyId_key" ON "Lookup_TankFarm"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_TankFarm_name_key" ON "Lookup_TankFarm"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_TaxRatio_legacyId_key" ON "Lookup_TaxRatio"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_TaxRatio_value_key" ON "Lookup_TaxRatio"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_TransportType_legacyId_key" ON "Lookup_TransportType"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_TransportType_name_key" ON "Lookup_TransportType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "Department_name_idx" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_identityNumber_key" ON "Employee"("identityNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE INDEX "Employee_employeeCode_idx" ON "Employee"("employeeCode");

-- CreateIndex
CREATE INDEX "Employee_firstName_idx" ON "Employee"("firstName");

-- CreateIndex
CREATE INDEX "Employee_lastName_idx" ON "Employee"("lastName");

-- CreateIndex
CREATE INDEX "Employee_status_idx" ON "Employee"("status");

-- CreateIndex
CREATE INDEX "Employee_type_idx" ON "Employee"("type");

-- CreateIndex
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");

-- CreateIndex
CREATE INDEX "Employee_userId_idx" ON "Employee"("userId");

-- CreateIndex
CREATE INDEX "Employee_bloodTypeId_idx" ON "Employee"("bloodTypeId");

-- CreateIndex
CREATE INDEX "Employee_locationId_idx" ON "Employee"("locationId");

-- CreateIndex
CREATE INDEX "Employee_cityId_idx" ON "Employee"("cityId");

-- CreateIndex
CREATE INDEX "Employee_districtId_idx" ON "Employee"("districtId");

-- CreateIndex
CREATE INDEX "Approval_module_idx" ON "Approval"("module");

-- CreateIndex
CREATE INDEX "Approval_entityType_entityId_idx" ON "Approval"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Approval_status_idx" ON "Approval"("status");

-- CreateIndex
CREATE INDEX "Approval_requestedById_idx" ON "Approval"("requestedById");

-- CreateIndex
CREATE INDEX "Approval_approverId_idx" ON "Approval"("approverId");

-- CreateIndex
CREATE INDEX "Approval_requestedAt_idx" ON "Approval"("requestedAt");

-- CreateIndex
CREATE INDEX "Approval_decidedAt_idx" ON "Approval"("decidedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_module_entityType_entityId_key" ON "Approval"("module", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Assignment_module_idx" ON "Assignment"("module");

-- CreateIndex
CREATE INDEX "Assignment_entityType_entityId_idx" ON "Assignment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Assignment_userId_idx" ON "Assignment"("userId");

-- CreateIndex
CREATE INDEX "Assignment_role_idx" ON "Assignment"("role");

-- CreateIndex
CREATE INDEX "Assignment_createdById_idx" ON "Assignment"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_module_entityType_entityId_userId_role_key" ON "Assignment"("module", "entityType", "entityId", "userId", "role");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuthEventLog_userId_idx" ON "AuthEventLog"("userId");

-- CreateIndex
CREATE INDEX "AuthEventLog_email_idx" ON "AuthEventLog"("email");

-- CreateIndex
CREATE INDEX "AuthEventLog_event_idx" ON "AuthEventLog"("event");

-- CreateIndex
CREATE INDEX "AuthEventLog_createdAt_idx" ON "AuthEventLog"("createdAt");

-- CreateIndex
CREATE INDEX "Document_module_idx" ON "Document"("module");

-- CreateIndex
CREATE INDEX "Document_entityType_entityId_idx" ON "Document"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Document_documentType_idx" ON "Document"("documentType");

-- CreateIndex
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");

-- CreateIndex
CREATE INDEX "Document_isActive_idx" ON "Document"("isActive");

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lookup_City" ADD CONSTRAINT "Lookup_City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Lookup_Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lookup_District" ADD CONSTRAINT "Lookup_District_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "Lookup_City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lookup_SubRegion" ADD CONSTRAINT "Lookup_SubRegion_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Lookup_Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lookup_TaxOffice" ADD CONSTRAINT "Lookup_TaxOffice_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "Lookup_City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_bloodTypeId_fkey" FOREIGN KEY ("bloodTypeId") REFERENCES "Lookup_BloodType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Lookup_Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "Lookup_City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "Lookup_District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthEventLog" ADD CONSTRAINT "AuthEventLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
