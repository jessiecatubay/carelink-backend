import { PatientProfileRepository } from "@/repositories/patient-profile.repository";
import { PatientProfile } from "@/types/user";

export async function UpdatePatientProfileService(
  id: string,
  data: Partial<PatientProfile>,
) {
  const patienProfileRepository = new PatientProfileRepository();

  try {
    await patienProfileRepository.update(id, data);

    return {
      code: 200,
      status: "success",
      message: "Successfully updated patient profile"
    }
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to update patient profile"
    }
  }
}
