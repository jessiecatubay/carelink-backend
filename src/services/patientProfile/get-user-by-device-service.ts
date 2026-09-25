import { PatientProfileRepository } from "@/repositories/patient-profile.repository"

export async function GetUserByDeviceService(deviceId: string) {
  const patientProfileRepository = new PatientProfileRepository();

  if(!deviceId) return {
    code: 500,
    status: "error",
    message: "Missing deviceId",
  }

  try {
    const user = await patientProfileRepository.getUserByDeviceId(deviceId);

    return {
      code: 200,
      status: "success",
      message: "Successfully got user by deviceId",
      data: user,
    }
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to get user by deviceId"
    }
  }
}