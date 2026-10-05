import { prisma } from "@/lib/prisma";

export async function PreviewPatientByCodeService(connectionCode: string) {
  try {
    const trimmedCode = (connectionCode || "").trim().toUpperCase();
    if (!trimmedCode) {
      return {
        code: 400,
        status: "error",
        message: "Connection code is required",
      };
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: {
        connectionCode: trimmedCode,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!patientProfile || !patientProfile.user) {
      return {
        code: 404,
        status: "error",
        message: "Invalid connection code. Patient device not found.",
      };
    }

    return {
      code: 200,
      status: "success",
      message: "Patient profile retrieved successfully",
      data: {
        patientId: patientProfile.userId,
        firstName: patientProfile.user.firstName,
        lastName: patientProfile.user.lastName,
        age: patientProfile.age,
        gender: patientProfile.gender,
        medicalConditions: patientProfile.medicalConditions,
        notes: patientProfile.notes,
        connectionCode: patientProfile.connectionCode,
      },
    };
  } catch (error: any) {
    console.error("PreviewPatientByCodeService error:", error);
    return {
      code: 500,
      status: "error",
      message: "Unable to retrieve patient profile",
    };
  }
}
