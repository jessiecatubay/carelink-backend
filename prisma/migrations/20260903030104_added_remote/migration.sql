-- CreateTable
CREATE TABLE "Remote" (
    "id" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Remote_pkey" PRIMARY KEY ("id")
);
