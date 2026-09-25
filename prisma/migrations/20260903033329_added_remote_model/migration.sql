/*
  Warnings:

  - Added the required column `deviceId` to the `Remote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Remote" ADD COLUMN     "deviceId" TEXT NOT NULL;
