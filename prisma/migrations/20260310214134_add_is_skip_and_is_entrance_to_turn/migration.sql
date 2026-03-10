/*
  Warnings:

  - A unique constraint covering the columns `[logId,turnOrder]` on the table `Turn` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Turn" ADD COLUMN     "isEntrance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSkip" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Turn_logId_turnOrder_key" ON "Turn"("logId", "turnOrder");
