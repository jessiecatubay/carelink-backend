/*
  Warnings:

  - Added the required column `batteryLevel` to the `VitalReadings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batteryLevelVoltage` to the `VitalReadings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NonPatientProfile" ADD COLUMN     "emergencyContactName" TEXT;

-- AlterTable
ALTER TABLE "VitalReadings" ADD COLUMN     "batteryLevel" INTEGER NOT NULL,
ADD COLUMN     "batteryLevelVoltage" DOUBLE PRECISION NOT NULL;
