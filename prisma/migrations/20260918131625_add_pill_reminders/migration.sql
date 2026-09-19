-- CreateEnum
CREATE TYPE "PillReminderStatus" AS ENUM ('PENDING', 'SENT', 'CANCELLED');

-- CreateTable
CREATE TABLE "PillReminder" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "PillReminderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PillReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PillReminder_patientId_idx" ON "PillReminder"("patientId");

-- CreateIndex
CREATE INDEX "PillReminder_scheduledAt_status_idx" ON "PillReminder"("scheduledAt", "status");

-- AddForeignKey
ALTER TABLE "PillReminder" ADD CONSTRAINT "PillReminder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PillReminder" ADD CONSTRAINT "PillReminder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
