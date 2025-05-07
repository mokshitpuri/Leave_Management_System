/*
  Warnings:

  - The `status` column on the `Record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `stage` on the `Record` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Record` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('awaiting', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('FACULTY', 'HOD', 'DIRECTOR');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('casual', 'earned', 'medical', 'academic');

-- DropIndex
DROP INDEX "Record_name_key";

-- AlterTable
ALTER TABLE "Record" DROP COLUMN "stage",
ADD COLUMN     "stage" "Stage" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "LeaveType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'awaiting',
ALTER COLUMN "rejMessage" DROP NOT NULL,
ALTER COLUMN "rejMessage" DROP DEFAULT;

-- DropEnum
DROP TYPE "leaveType";

-- DropEnum
DROP TYPE "stage";

-- DropEnum
DROP TYPE "status";

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
