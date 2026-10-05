import { prisma } from "@/lib/prisma";

export async function FindConnectedCaregiversService(patientId: string) {
  try {
    if (!patientId) {
      return {
        code: 400,
        status: "error",
        message: "Patient ID is required",
      };
    }

    const connections = await prisma.patientNonPatient.findMany({
      where: {
        patientId,
        status: "CONNECTED",
      },
      include: {
        nonPatient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            createdAt: true,
            nonPatientProfile: {
              select: {
                relationship: true,
                emergencyContact: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      code: 200,
      status: "success",
      message: "Successfully found connected caregivers",
      data: connections,
    };
  } catch (error: any) {
    console.error("FindConnectedCaregiversService error:", error);
    return {
      code: 500,
      status: "error",
      message: "Unable to find connected caregivers",
    };
  }
}
