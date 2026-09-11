/*
  Warnings:

  - Added the required column `nonPatientId` to the `Commands` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commands" ADD COLUMN     "nonPatientId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Commands_nonPatientId_idx" ON "Commands"("nonPatientId");

-- AddForeignKey
ALTER TABLE "Commands" ADD CONSTRAINT "Commands_nonPatientId_fkey" FOREIGN KEY ("nonPatientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
