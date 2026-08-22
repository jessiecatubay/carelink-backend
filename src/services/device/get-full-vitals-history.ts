import { VitalsRepository } from "@/repositories/vitals-history.repository";

export async function GetVitalsHistoryService () {
  const vitalsRepository = new VitalsRepository();

  try {
    const data = await vitalsRepository.get();

    return {
      code: 200,
      status: "success",
      message: "Successfully fetched vitals",
      data: data
    }
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to get vitals",
    }
  }
}