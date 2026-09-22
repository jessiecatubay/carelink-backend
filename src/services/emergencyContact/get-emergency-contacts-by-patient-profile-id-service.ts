import { EmergencyContactRepository } from "@/repositories/emergency-contact.repository";

export async function GetEmergencyContactsByPatientProfileIdService(patientProfileId: string) {
  const emergencyContactRepository = new EmergencyContactRepository();

  try {
    const result = await emergencyContactRepository.getByPatientProfileId(patientProfileId);

    return {
      code: 200,
      status: "success",
      message: "Successfully fetched emergency contacts for patient profile",
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      status: "error",
      message: "Unable to fetch emergency contacts for patient profile",
    };
  }
}