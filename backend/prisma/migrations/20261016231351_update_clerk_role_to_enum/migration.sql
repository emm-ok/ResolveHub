/*
  Warnings:

  - Changed the type of `clerkRole` on the `CompanyRole` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ClerkRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF', 'INVESTIGATOR');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'USER_REGISTERED';
ALTER TYPE "AuditAction" ADD VALUE 'ORGANIZATION_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'MEMBER_INVITED';
ALTER TYPE "AuditAction" ADD VALUE 'MEMBER_JOINED';
ALTER TYPE "AuditAction" ADD VALUE 'MEMBER_DEACTIVATED';
ALTER TYPE "AuditAction" ADD VALUE 'CASE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'CASE_ASSIGNED';
ALTER TYPE "AuditAction" ADD VALUE 'CASE_REASSIGNED';
ALTER TYPE "AuditAction" ADD VALUE 'STATUS_CHANGED';
ALTER TYPE "AuditAction" ADD VALUE 'PRIORITY_CHANGED';
ALTER TYPE "AuditAction" ADD VALUE 'INVESTIGATION_STARTED';
ALTER TYPE "AuditAction" ADD VALUE 'INVESTIGATION_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'EVIDENCE_UPLOADED';
ALTER TYPE "AuditAction" ADD VALUE 'EVIDENCE_ACCESSED';
ALTER TYPE "AuditAction" ADD VALUE 'MESSAGE_SENT';
ALTER TYPE "AuditAction" ADD VALUE 'RESOLUTION_PROPOSED';
ALTER TYPE "AuditAction" ADD VALUE 'RESOLUTION_ACCEPTED';
ALTER TYPE "AuditAction" ADD VALUE 'RESOLUTION_REJECTED';
ALTER TYPE "AuditAction" ADD VALUE 'CASE_ESCALATED';
ALTER TYPE "AuditAction" ADD VALUE 'CASE_CLOSED';

-- AlterTable
ALTER TABLE "CompanyRole" DROP COLUMN "clerkRole",
ADD COLUMN     "clerkRole" "ClerkRole" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CompanyRole_companyId_clerkRole_key" ON "CompanyRole"("companyId", "clerkRole");
