-- CreateEnum
CREATE TYPE "status" AS ENUM ('awaiting', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "stage" AS ENUM ('FACULTY', 'HOD', 'DIRECTOR');

-- CreateEnum
CREATE TYPE "leaveType" AS ENUM ('causual', 'earned', 'medical', 'academic');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FACULTY', 'HOD', 'DIRECTOR');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "casualLeave" INTEGER NOT NULL DEFAULT 12,
    "earnedLeave" INTEGER NOT NULL DEFAULT 15,
    "medicalLeave" INTEGER NOT NULL DEFAULT 10,
    "academicLeave" INTEGER NOT NULL DEFAULT 15,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Record" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" "stage" NOT NULL,
    "type" "leaveType" NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "status" "status" NOT NULL,
    "reqMessage" TEXT NOT NULL DEFAULT 'applied for leave',
    "rejMessage" TEXT NOT NULL DEFAULT 'awaiting confimation',

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Record_name_key" ON "Record"("name");
