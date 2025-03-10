/*
  Warnings:

  - The values [causual] on the enum `leaveType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "leaveType_new" AS ENUM ('casual', 'earned', 'medical', 'academic');
ALTER TABLE "Record" ALTER COLUMN "type" TYPE "leaveType_new" USING ("type"::text::"leaveType_new");
ALTER TYPE "leaveType" RENAME TO "leaveType_old";
ALTER TYPE "leaveType_new" RENAME TO "leaveType";
DROP TYPE "leaveType_old";
COMMIT;
