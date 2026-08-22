/*
  Warnings:

  - You are about to drop the `Device` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_patientId_fkey";

-- DropForeignKey
ALTER TABLE "VitalReadings" DROP CONSTRAINT "VitalReadings_deviceId_fkey";

-- DropTable
DROP TABLE "Device";
