import { prisma } from "@/lib/prisma";

export async function RemoveDeviceOwnedService(userId: string) {
  if (!userId) {
    return {
      code: 400,
      status: "error",
      message: "User ID is required",
    };
  }

  try {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      select: { id: true, deviceOwned: true },
    });

    if (!profile || !profile.deviceOwned) {
      return {
        code: 404,
        status: "error",
        message: "No registered device found for this account.",
      };
    }

    const removedDeviceId = profile.deviceOwned;

    await prisma.patientProfile.update({
      where: { userId },
      data: { deviceOwned: null },
    });

    return {
      code: 200,
      status: "success",
      message: `Device "${removedDeviceId}" has been successfully removed from your account.`,
      data: {
        removedDeviceId,
      },
    };
  } catch (error) {
    console.error("RemoveDeviceOwnedService error:", error);
    return {
      code: 500,
      status: "error",
      message: "Unable to remove device. Please try again.",
    };
  }
}
