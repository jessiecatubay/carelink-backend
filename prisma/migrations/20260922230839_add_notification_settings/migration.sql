-- AlterTable
ALTER TABLE "User" ADD COLUMN     "alertSoundEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
