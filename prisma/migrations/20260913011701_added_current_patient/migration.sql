-- AlterTable
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "PatientNonPatient" ADD COLUMN     "currentPatient" BOOLEAN NOT NULL DEFAULT false;
