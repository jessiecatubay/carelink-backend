import { EmergencyContactRepository } from "@/repositories/emergency-contact.repository";
import { EmergencyContactData } from "@/types/emergency-contact";

export async function UpdateEmergencyContactService(
  id: string,
  data: EmergencyContactData,
) {
  const emergencyContactRepository = new EmergencyContactRepository();

  try {
    const result = await emergencyContactRepository.update(id, data);

    return {
      code: 200,
      status: "success",
      message: "Emergency contact updated successfully",
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      status: "error",
      message: "Unable to update emergency contact",
    };
  }
}