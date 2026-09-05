/*
  Warnings:

  - You are about to drop the column `emergencyNumber` on the `CaregiverProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CaregiverProfile" DROP COLUMN "emergencyNumber",
ADD COLUMN     "emergencyContact" TEXT;
