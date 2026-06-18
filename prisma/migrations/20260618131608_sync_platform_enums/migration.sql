/*
  Warnings:

  - The values [MAINTENANCE_REQUEST] on the enum `ApprovalEntityType` will be removed. If these variants are still used in the database, this will fail.
  - The values [MAINTENANCE_RECORD] on the enum `AssignmentEntityType` will be removed. If these variants are still used in the database, this will fail.
  - The values [MAINTENANCE_RECORD] on the enum `DocumentEntityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApprovalEntityType_new" AS ENUM ('PURCHASE_REQUEST', 'PURCHASE_ORDER', 'PURCHASE_INVOICE', 'SUPPLIER', 'SUPPLIER_DOCUMENT', 'QUALITY_INSPECTION', 'QUALITY_DEVIATION', 'QUALITY_CERTIFICATE', 'PRODUCTION_ORDER', 'PRODUCTION_BATCH', 'SHIPMENT_PLAN', 'DISPATCH_NOTE', 'MAINTENANCE', 'EQUIPMENT', 'SALES_ORDER', 'SALES_DISCOUNT', 'IMPORT_REQUEST', 'UTILITY_READING', 'OTHER');
ALTER TABLE "approvals" ALTER COLUMN "entityType" TYPE "ApprovalEntityType_new" USING ("entityType"::text::"ApprovalEntityType_new");
ALTER TYPE "ApprovalEntityType" RENAME TO "ApprovalEntityType_old";
ALTER TYPE "ApprovalEntityType_new" RENAME TO "ApprovalEntityType";
DROP TYPE "public"."ApprovalEntityType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApprovalModule" ADD VALUE 'ACCOUNTING';
ALTER TYPE "ApprovalModule" ADD VALUE 'UTILITY';

-- AlterEnum
BEGIN;
CREATE TYPE "AssignmentEntityType_new" AS ENUM ('PURCHASE_INVOICE', 'PURCHASE_REQUEST', 'PURCHASE_ORDER', 'SUPPLIER', 'SUPPLIER_DOCUMENT', 'QUALITY_INSPECTION', 'QUALITY_CERTIFICATE', 'QUALITY_DEVIATION', 'PRODUCTION_ORDER', 'PRODUCTION_BATCH', 'SHIPMENT_PLAN', 'DISPATCH_NOTE', 'MAINTENANCE', 'EQUIPMENT', 'SALES_ORDER', 'SALES_DISCOUNT', 'IMPORT_REQUEST', 'UTILITY_READING', 'OTHER');
ALTER TABLE "assignments" ALTER COLUMN "entityType" TYPE "AssignmentEntityType_new" USING ("entityType"::text::"AssignmentEntityType_new");
ALTER TYPE "AssignmentEntityType" RENAME TO "AssignmentEntityType_old";
ALTER TYPE "AssignmentEntityType_new" RENAME TO "AssignmentEntityType";
DROP TYPE "public"."AssignmentEntityType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "AssignmentModule" ADD VALUE 'UTILITY';

-- AlterEnum
BEGIN;
CREATE TYPE "DocumentEntityType_new" AS ENUM ('PURCHASE_INVOICE', 'PURCHASE_REQUEST', 'PURCHASE_ORDER', 'SUPPLIER', 'SUPPLIER_DOCUMENT', 'QUALITY_INSPECTION', 'QUALITY_CERTIFICATE', 'QUALITY_DEVIATION', 'PRODUCTION_ORDER', 'PRODUCTION_BATCH', 'SHIPMENT_PLAN', 'DISPATCH_NOTE', 'MAINTENANCE', 'EQUIPMENT', 'EMPLOYEE', 'UTILITY_READING', 'OTHER');
ALTER TABLE "documents" ALTER COLUMN "entityType" TYPE "DocumentEntityType_new" USING ("entityType"::text::"DocumentEntityType_new");
ALTER TYPE "DocumentEntityType" RENAME TO "DocumentEntityType_old";
ALTER TYPE "DocumentEntityType_new" RENAME TO "DocumentEntityType";
DROP TYPE "public"."DocumentEntityType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "DocumentModule" ADD VALUE 'UTILITY';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'SDS';
ALTER TYPE "DocumentType" ADD VALUE 'TDS';
ALTER TYPE "DocumentType" ADD VALUE 'UTILITY_REPORT';
