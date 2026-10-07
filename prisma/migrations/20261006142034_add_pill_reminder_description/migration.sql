/*
  Warnings:

  - You are about to drop the column `batteryLevelVoltage` on the `VitalReadings` table. All the data in the column will be lost.
  - Added the required column `batteryVoltage` to the `VitalReadings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PillReminder" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "VitalReadings" DROP COLUMN "batteryLevelVoltage",
ADD COLUMN     "batteryVoltage" DOUBLE PRECISION NOT NULL;
