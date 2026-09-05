import { PatientProfileRepository } from "@/repositories/patient-profile.repository";
import { generateCode } from "@/utils/generateConnectionCode";

export async function GenerateConnectionCodeService(id: string) {
  const patientProfileRepository = new PatientProfileRepository();

  try {
    const code = generateCode();

    await patientProfileRepository.update(id, { connectionCode: code });

    return {
      code: 200,
      status: "success",
      message: "Successfully generated connection code"
    }
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to generate connection code"
    }
  }
}