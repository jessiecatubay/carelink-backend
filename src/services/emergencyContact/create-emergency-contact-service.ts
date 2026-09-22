import { EmergencyContactData } from "@/types/emergency-contact";
import { EmergencyContactRepository } from "@/repositories/emergency-contact.repository";

export async function CreateEmergencyContactService(data: EmergencyContactData) {
  const emergencyContactRepository = new EmergencyContactRepository();

  try {
    const result = await emergencyContactRepository.create({ 
      name: data.name,
      relationship: data.relationship,
      phoneNumber: data.phoneNumber,
      patientProfileId: data.patientProfileId
     });

    return {
      code: 201,
      status: "success",
      message: "Emergency contact created successfully",
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      status: "error",
      message: "Unable to create emergency contact",
    };
  }
}