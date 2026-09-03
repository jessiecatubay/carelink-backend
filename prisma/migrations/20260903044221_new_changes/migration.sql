/*
  Warnings:

  - Changed the type of `command` on the `Remote` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Command" AS ENUM ('ASSISTANCE', 'FOOD', 'WATER', 'EMERGENCY');

-- AlterTable
ALTER TABLE "Remote" ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
DROP COLUMN "command",
ADD COLUMN     "command" "Command" NOT NULL;
