/*
  Warnings:

  - The `caseId` column on the `CaseRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CaseRequest" DROP COLUMN "caseId",
ADD COLUMN     "caseId" UUID;

-- AlterTable
ALTER TABLE "SLAPolicy" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;
