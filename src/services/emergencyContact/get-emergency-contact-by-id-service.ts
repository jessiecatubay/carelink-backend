import { EmergencyContactRepository } from "@/repositories/emergency-contact.repository";

export async function GetEmergencyContactByIdService(id: string) {
  const emergencyContactRepository = new EmergencyContactRepository();

  try {
    const result = await emergencyContactRepository.getById(id);

    if (!result) {
      return {
        code: 404,
        status: "error",
        message: "Emergency contact not found",
      };
    }

    return {
      code: 200,
      status: "success",
      message: "Successfully fetched emergency contact by id",
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      status: "error",
      message: "Unable to fetch emergency contact by id",
    };
  }
}