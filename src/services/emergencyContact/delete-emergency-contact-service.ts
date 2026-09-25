import { EmergencyContactRepository } from "@/repositories/emergency-contact.repository";

export async function DeleteEmergencyContactService(id: string) {
  const emergencyContactRepository = new EmergencyContactRepository();

  try {
    await emergencyContactRepository.delete(id);

    return {
      code: 200,
      status: "success",
      message: "Emergency contact deleted successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      status: "error",
      message: "Unable to delete emergency contact",
    };
  }
}