import { prisma } from "@/lib/prisma";
import { PatientProfileRepository } from "@/repositories/patient-profile.repository";

export async function RegisterDeviceOwnedService(userId: string, deviceId: string) {
  const patientProfileRepository = new PatientProfileRepository();

  if (!deviceId || !userId) {
    return {
      code: 400,
      status: "error",
      message: "Device ID and user ID are required",
    };
  }

  const cleanDeviceId = deviceId.trim();

  try {
    // 1. Check if the device is already owned in the database
    const existingProfile =
      await patientProfileRepository.getUserByDeviceId(cleanDeviceId);

    if (existingProfile) {
      const isOwnedBySelf = existingProfile.userId === userId;

      return {
        code: 409,
        status: "error",
        alreadyOwned: true,
        isOwnedBySelf,
        message: isOwnedBySelf
          ? "This device is already registered to your account."
          : "This device is already owned and registered to another account.",
        data: {
          deviceId: cleanDeviceId,
          alreadyOwned: true,
          isOwnedBySelf,
        },
      };
    }

    // 2. Safely register the deviceOwned via upsert
    await prisma.patientProfile.upsert({
      where: { userId },
      update: { deviceOwned: cleanDeviceId },
      create: { userId, deviceOwned: cleanDeviceId },
    });

    return {
      code: 200,
      status: "success",
      alreadyOwned: false,
      message: "Device successfully registered.",
      data: {
        deviceId: cleanDeviceId,
        alreadyOwned: false,
      },
    };
  } catch (error: any) {
    console.error("RegisterDeviceOwnedService error:", error);

    // Prisma unique constraint violation code
    if (error?.code === "P2002" || String(error?.message).includes("deviceOwned")) {
      return {
        code: 409,
        status: "error",
        alreadyOwned: true,
        isOwnedBySelf: false,
        message: "This device is already owned and registered to another account.",
        data: {
          deviceId: cleanDeviceId,
          alreadyOwned: true,
        },
      };
    }

    return {
      code: 500,
      status: "error",
      message: "Unable to register device. Please try again.",
    };
  }
}