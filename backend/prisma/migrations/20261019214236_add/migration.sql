/*
  Warnings:

  - You are about to drop the column `clerkOrganizationId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `clerkInvitationId` on the `CompanyInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `clerkMembershipId` on the `CompanyMember` table. All the data in the column will be lost.
  - You are about to drop the column `clerkRoleKey` on the `CompanyRole` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `CompanyInvitation` will be added. If there are existing duplicate values, this will fail.
  - Made the column `createdByUserId` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tokenHash` to the `CompanyInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_createdByUserId_fkey";

-- DropIndex
DROP INDEX "Company_clerkOrganizationId_key";

-- DropIndex
DROP INDEX "CompanyInvitation_clerkInvitationId_key";

-- DropIndex
DROP INDEX "CompanyMember_clerkMembershipId_key";

-- DropIndex
DROP INDEX "CompanyRole_companyId_clerkRoleKey_idx";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "clerkOrganizationId",
ALTER COLUMN "createdByUserId" SET NOT NULL;

-- AlterTable
ALTER TABLE "CompanyInvitation" DROP COLUMN "clerkInvitationId",
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CompanyMember" DROP COLUMN "clerkMembershipId";

-- AlterTable
ALTER TABLE "CompanyRole" DROP COLUMN "clerkRoleKey";

-- CreateIndex
CREATE UNIQUE INDEX "CompanyInvitation_tokenHash_key" ON "CompanyInvitation"("tokenHash");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
