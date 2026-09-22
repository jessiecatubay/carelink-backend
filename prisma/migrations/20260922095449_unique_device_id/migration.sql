/*
  Warnings:

  - A unique constraint covering the columns `[deviceOwned]` on the table `PatientProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_deviceOwned_key" ON "PatientProfile"("deviceOwned");
