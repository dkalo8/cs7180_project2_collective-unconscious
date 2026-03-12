/*
  Warnings:

  - The `category` column on the `Log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `accessMode` column on the `Log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `turnMode` column on the `Log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Report` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `action` on the `ModerationAction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `targetType` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AccessMode" AS ENUM ('OPEN', 'PRIVATE');

-- CreateEnum
CREATE TYPE "TurnMode" AS ENUM ('FREESTYLE', 'STRUCTURED');

-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FREEWRITING', 'HAIKU', 'POEM', 'SHORT_NOVEL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('TURN', 'LOG');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'DISMISSED', 'ACTIONED');

-- CreateEnum
CREATE TYPE "ModAction" AS ENUM ('HIDE_TURN', 'CLOSE_LOG', 'DISMISS');

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'FREEWRITING',
DROP COLUMN "accessMode",
ADD COLUMN     "accessMode" "AccessMode" NOT NULL DEFAULT 'OPEN',
DROP COLUMN "turnMode",
ADD COLUMN     "turnMode" "TurnMode" NOT NULL DEFAULT 'FREESTYLE',
DROP COLUMN "status",
ADD COLUMN     "status" "LogStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "ModerationAction" DROP COLUMN "action",
ADD COLUMN     "action" "ModAction" NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "targetType",
ADD COLUMN     "targetType" "TargetType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';
