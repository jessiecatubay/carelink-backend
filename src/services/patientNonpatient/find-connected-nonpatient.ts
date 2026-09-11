import { PatientNonpatientRepository } from "@/repositories/patient-nonpatient-repository";

export async function FindConnectedNonpatientService(patientId: string) {
  const patientNonpatientRepository = new PatientNonpatientRepository();

  try {
    if (!patientId) {
      return {
        code: 500,
        status: "error",
        message: "No patient id",
      };
    }
    const result =
      await patientNonpatientRepository.findConnectedNonPatients(patientId);

    return {
      code: 200,
      status: "success",
      message: "Successfully found connected nonpatients",
      data: result.map(({ nonPatientId }) => nonPatientId),
    };
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to find connected nonpatient",
    };
  }
}
