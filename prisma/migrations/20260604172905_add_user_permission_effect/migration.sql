/*
  Warnings:

  - Added the required column `updatedAt` to the `UserPermission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PermissionEffect" AS ENUM ('ALLOW', 'DENY');

-- AlterTable
ALTER TABLE "UserPermission" ADD COLUMN     "effect" "PermissionEffect" NOT NULL DEFAULT 'ALLOW',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "UserPermission_effect_idx" ON "UserPermission"("effect");
