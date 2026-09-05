/*
  Warnings:

  - A unique constraint covering the columns `[connectionCode]` on the table `PatientProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED');

-- AlterTable
ALTER TABLE "PatientProfile" ADD COLUMN     "connectionCode" TEXT;

-- CreateTable
CREATE TABLE "PatientCaregiver" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientCaregiver_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientCaregiver_patientId_idx" ON "PatientCaregiver"("patientId");

-- CreateIndex
CREATE INDEX "PatientCaregiver_caregiverId_idx" ON "PatientCaregiver"("caregiverId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientCaregiver_patientId_caregiverId_key" ON "PatientCaregiver"("patientId", "caregiverId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_connectionCode_key" ON "PatientProfile"("connectionCode");

-- AddForeignKey
ALTER TABLE "PatientCaregiver" ADD CONSTRAINT "PatientCaregiver_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientCaregiver" ADD CONSTRAINT "PatientCaregiver_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
