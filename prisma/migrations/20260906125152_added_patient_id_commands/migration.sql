/*
  Warnings:

  - Added the required column `patientId` to the `Commands` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commands" ADD COLUMN     "patientId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Commands_patientId_idx" ON "Commands"("patientId");

-- AddForeignKey
ALTER TABLE "Commands" ADD CONSTRAINT "Commands_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
