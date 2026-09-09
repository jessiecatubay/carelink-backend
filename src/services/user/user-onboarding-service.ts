import { Role } from "@/generated/prisma/browser";
import { prisma } from "@/lib/prisma";

export async function UserOnboardingService(
  userId: string,
  role: Role,
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      if (role !== Role.PATIENT && role !== Role.NON_PATIENT) {
        throw new Error("INVALID_ROLE");
      }

      const updatedUser = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          role,
          onBoarded: true,
        },
      });

      if (role === Role.PATIENT) {
        await tx.patientProfile.create({
          data: {
            userId: user.id,
          },
        });
      }

      if (role === Role.NON_PATIENT) {
        await tx.nonPatientProfile.create({
          data: {
            userId: user.id,
          },
        });
      }

      return updatedUser;
    });

    return {
      code: 200,
      status: "success",
      message: "User onboarded successfully",
      data: result,
    };

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return {
          code: 404,
          status: "error",
          message: "User not found",
        };
      }

      if (error.message === "INVALID_ROLE") {
        return {
          code: 400,
          status: "error",
          message: "Invalid role",
        };
      }
    }

    console.error("Error occurred while onboarding user:", error);

    return {
      code: 500,
      status: "error",
      message: "Unable to onboard user",
    };
  }
}