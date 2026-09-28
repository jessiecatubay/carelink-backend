import { PatientNonpatientRepository } from "@/repositories/patient-nonpatient-repository";
import { UserRepository } from "@/repositories/user.repository";

export async function ConnectPatientNonpatientService(
  nonPatientId: string,
  connectionCode: string,
) {
  const userRepository = new UserRepository();
  const patientNonpatientRepository = new PatientNonpatientRepository();

  try {
    const trimmedCode = (connectionCode || "").trim().toUpperCase();
    if (!trimmedCode) {
      return {
        code: 400,
        status: "error",
        message: "Connection code is required",
      };
    }

    const nonPatient = await userRepository.getById(nonPatientId);
    const patientProfile = await userRepository.getUserByCode(trimmedCode);

    if (!nonPatient) {
      return {
        code: 404,
        status: "error",
        message: "User account not found",
      };
    }

    if (!patientProfile) {
      return {
        code: 404,
        status: "error",
        message: "Invalid connection code. Patient device not found.",
      };
    }

    if (patientProfile.userId === nonPatientId) {
      return {
        code: 400,
        status: "error",
        message: "You cannot connect to your own patient account.",
      };
    }

    const existingConnection = await patientNonpatientRepository.findAnyConnection(
      patientProfile.userId,
      nonPatientId,
    );

    if (existingConnection) {
      if (existingConnection.status === "CONNECTED") {
        return {
          code: 400,
          status: "error",
          message: "Patient and non-patient are already connected",
          connection: existingConnection,
        };
      }

      await patientNonpatientRepository.update(
        patientProfile.userId,
        nonPatientId,
        {
          status: "CONNECTED",
          currentPatient: true,
        },
      );

      return {
        code: 200,
        status: "success",
        message: "Successfully reconnected patientNonpatient",
      };
    }

    await patientNonpatientRepository.create({
      patientId: patientProfile.userId,
      nonPatientId,
      status: "CONNECTED",
      currentPatient: true,
    });

    return {
      code: 201,
      status: "success",
      message: "Successfully connected patientNonpatient",
    };
  } catch (error: any) {
    console.error("ConnectPatientNonpatientService error:", error);
    return {
      code: 500,
      status: "error",
      message: error?.message || "Unable to connect patientNonpatient",
    };
  }
}
