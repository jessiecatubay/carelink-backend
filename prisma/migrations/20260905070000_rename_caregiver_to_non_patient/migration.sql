-- Preserve existing profiles and connections while adopting neutral terminology.
ALTER TYPE "Role" RENAME VALUE 'CAREGIVER' TO 'NON_PATIENT';

ALTER TABLE "CaregiverProfile" RENAME TO "NonPatientProfile";
ALTER TABLE "NonPatientProfile" RENAME CONSTRAINT "CaregiverProfile_pkey" TO "NonPatientProfile_pkey";
ALTER TABLE "NonPatientProfile" RENAME CONSTRAINT "CaregiverProfile_userId_fkey" TO "NonPatientProfile_userId_fkey";
ALTER INDEX "CaregiverProfile_userId_key" RENAME TO "NonPatientProfile_userId_key";

ALTER TABLE "PatientCaregiver" RENAME TO "PatientNonPatient";
ALTER TABLE "PatientNonPatient" RENAME COLUMN "caregiverId" TO "nonPatientId";
ALTER TABLE "PatientNonPatient" RENAME CONSTRAINT "PatientCaregiver_pkey" TO "PatientNonPatient_pkey";
ALTER TABLE "PatientNonPatient" RENAME CONSTRAINT "PatientCaregiver_patientId_fkey" TO "PatientNonPatient_patientId_fkey";
ALTER TABLE "PatientNonPatient" RENAME CONSTRAINT "PatientCaregiver_caregiverId_fkey" TO "PatientNonPatient_nonPatientId_fkey";
ALTER INDEX "PatientCaregiver_patientId_idx" RENAME TO "PatientNonPatient_patientId_idx";
ALTER INDEX "PatientCaregiver_caregiverId_idx" RENAME TO "PatientNonPatient_nonPatientId_idx";
ALTER INDEX "PatientCaregiver_patientId_caregiverId_key" RENAME TO "PatientNonPatient_patientId_nonPatientId_key";
