import { PatientNonpatientRepository } from "@/repositories/patient-nonpatient-repository";
import { UserRepository } from "@/repositories/user.repository";

export async function ConnectPatientNonpatientService(
  nonPatientId: string,
  connectionCode: string,
) {
  const userRepository = new UserRepository();
  const patientNonpatientRepository = new PatientNonpatientRepository();

  try {
    const nonPatient = await userRepository.getById(nonPatientId);
    const patientId = await userRepository.getUserByCode(connectionCode);

    if (!nonPatient || !patientId) {
      return {
        code: 500,
        status: "error",
        message: "Missing Data",
      };
    }

    const isConnected = await patientNonpatientRepository.findConnection(
      patientId.userId,
      nonPatientId,
    );

    if (isConnected) {
      return {
        code: 500,
        status: "error",
        message: "Patient and non-patient are already connected",
        connection: isConnected,
      };
    }

    await patientNonpatientRepository.create({
      patientId: patientId.userId,
      nonPatientId,
      status: "CONNECTED",
    });

    return {
      code: 201,
      status: "success",
      message: "Successfully connected patientNonpatient",
    };
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to connect patientNonpatient",
    };
  }
}
