import { VitalsRepository } from "@/repositories/vitals-history.repository";

export async function GetRecentVitalsHistoryService(
  userId: string,
  targetPatientId?: string,
) {
  const vitalsRepository = new VitalsRepository();

  try {
    const data = await vitalsRepository.getRecent(userId, targetPatientId);

    return {
      code: 200,
      status: "success",
      message: "Successfully fetched vitals",
      data: data,
    };
  } catch (error) {
    console.error("GetRecentVitalsHistoryService error:", error);
    return {
      code: 500,
      status: "error",
      message: "Unable to get vitals",
    };
  }
}
