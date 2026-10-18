/*
  Warnings:

  - The values [OWNER] on the enum `SystemRoleType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SystemRoleType_new" AS ENUM ('ADMIN', 'AGENT', 'INVESTIGATOR', 'VIEWER');
ALTER TABLE "CompanyRole" ALTER COLUMN "systemRole" TYPE "SystemRoleType_new" USING ("systemRole"::text::"SystemRoleType_new");
ALTER TYPE "SystemRoleType" RENAME TO "SystemRoleType_old";
ALTER TYPE "SystemRoleType_new" RENAME TO "SystemRoleType";
DROP TYPE "public"."SystemRoleType_old";
COMMIT;
