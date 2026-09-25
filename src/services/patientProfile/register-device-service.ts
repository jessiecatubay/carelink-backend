import { PatientProfileRepository } from "@/repositories/patient-profile.repository";

export async function RegisterDeviceOwnedService(id: string, deviceId: string) {
  const patientProfileRepository = new PatientProfileRepository();

  if(!deviceId || !id) return {
    code: 500,
    status: "error",
    message: "Missing deviceId"
  }

  console.log(id, deviceId);

  try {
    await patientProfileRepository.update(id, { deviceOwned: deviceId });

    return {
      code: 200,
      status: "success",
      message: "Successfully registered deviceOwned",
    }
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to register deviceOwned",
    }
  }
}