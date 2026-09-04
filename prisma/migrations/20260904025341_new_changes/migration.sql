/*
  Warnings:

  - You are about to drop the `Remote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Remote";

-- CreateTable
CREATE TABLE "Commands" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "command" "Command" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" TEXT NOT NULL,

    CONSTRAINT "Commands_pkey" PRIMARY KEY ("id")
);
