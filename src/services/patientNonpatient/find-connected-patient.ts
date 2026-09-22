// src/services/patientNonpatient/find-connected-patient.ts

import { PatientNonpatientRepository } from "@/repositories/patient-nonpatient-repository";

export async function FindConnectedPatientService(nonPatientId: string) {
  const patientNonpatientRepository = new PatientNonpatientRepository();

  try {
    if (!nonPatientId) {
      return {
        code: 400,
        status: "error",
        message: "No nonPatient id provided",
      };
    }

    const result =
      await patientNonpatientRepository.findConnectedPatients(nonPatientId);

    return {
      code: 200,
      status: "success",
      message: "Successfully found connected patients",
      data: result,
    };
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to find connected patients",
    };
  }
}