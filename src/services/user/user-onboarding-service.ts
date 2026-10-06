import { Role } from "@/generated/prisma/client";
import { TokenType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { OnboardingData } from "@/types/user";
import { generateCode } from "@/utils/generateConnectionCode";
import { generateTokens } from "@/utils/jwt";
import { capitalizeWords } from "@/utils/string";

export async function UserOnboardingService(
  userId: string,
  role: Role | string,
  data: Partial<OnboardingData>,
) {
  try {
    const rawRole = typeof role === "string" ? role.replace("-", "_").toUpperCase() : role;
    const normalizedRole = rawRole as Role;

    if (normalizedRole !== Role.PATIENT && normalizedRole !== Role.NON_PATIENT) {
      return {
        code: 400,
        status: "error",
        message: "Invalid role. Role must be PATIENT or NON_PATIENT",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          role: normalizedRole,
          onBoarded: true,
        },
      });

      if (normalizedRole === Role.PATIENT) {
        const existingProfile = await tx.patientProfile.findUnique({
          where: {
            userId: user.id,
          },
        });

        const connectionCode = existingProfile?.connectionCode || generateCode();
        const parsedAge =
          data.age !== undefined && data.age !== null && data.age !== ("" as any)
            ? Number(data.age)
            : undefined;

        await tx.patientProfile.upsert({
          where: {
            userId: user.id,
          },
          update: {
            age: parsedAge !== undefined && !isNaN(parsedAge) ? parsedAge : undefined,
            gender: data.gender ? capitalizeWords(data.gender) : data.gender,
            medicalConditions: data.medicalConditions,
            notes: data.notes,
            ...(!existingProfile?.connectionCode ? { connectionCode } : {}),
          },
          create: {
            age: parsedAge !== undefined && !isNaN(parsedAge) ? parsedAge : null,
            gender: data.gender ? capitalizeWords(data.gender) : null,
            medicalConditions: data.medicalConditions || null,
            notes: data.notes || null,
            userId: user.id,
            connectionCode,
          },
        });
      }

      if (normalizedRole === Role.NON_PATIENT) {
        await tx.nonPatientProfile.upsert({
          where: {
            userId: user.id,
          },
          update: {
            relationship: data.relationship ? capitalizeWords(data.relationship) : data.relationship,
            emergencyContact: data.emergencyContact,
            emergencyContactName: data.emergencyContactName ? capitalizeWords(data.emergencyContactName) : data.emergencyContactName,
          },
          create: {
            userId: user.id,
            relationship: data.relationship ? capitalizeWords(data.relationship) : data.relationship,
            emergencyContact: data.emergencyContact,
            emergencyContactName: data.emergencyContactName ? capitalizeWords(data.emergencyContactName) : data.emergencyContactName,
          },
        });
      }

      const fullUser = await tx.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          patientProfile: true,
          nonPatientProfile: true,
        },
      });

      if (!fullUser) {
        throw new Error("USER_NOT_FOUND");
      }

      const tokens = generateTokens({
        id: fullUser.id,
        email: fullUser.email ?? "",
        role: fullUser.role,
      });

      await tx.token.create({
        data: {
          userId: fullUser.id,
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          type: TokenType.REFRESH,
        },
      });

      return {
        user: {
          id: fullUser.id,
          firstName: fullUser.firstName,
          lastName: fullUser.lastName,
          email: fullUser.email,
          role: fullUser.role,
          onBoarded: fullUser.onBoarded,
          emergencyContact: fullUser.nonPatientProfile?.emergencyContact,
          emergencyContactName: fullUser.nonPatientProfile?.emergencyContactName,
          googleId: fullUser.googleId,
          hasPassword: Boolean(fullUser.password),
          patientProfile: fullUser.patientProfile,
          nonPatientProfile: fullUser.nonPatientProfile,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
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
