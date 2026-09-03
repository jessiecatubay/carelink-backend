/*
  Warnings:

  - Added the required column `sensorContact` to the `VitalReadings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VitalReadings" ADD COLUMN     "sensorContact" BOOLEAN NOT NULL;
