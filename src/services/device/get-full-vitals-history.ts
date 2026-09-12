import { VitalsRepository } from "@/repositories/vitals-history.repository";
import { PaginationParams } from "@/utils/pagination";

export async function GetVitalsHistoryService(
  nonPatientId: string,
  pagination: PaginationParams,
) {
  const vitalsRepository = new VitalsRepository();

  try {
    const result = await vitalsRepository.get(nonPatientId, pagination);
    const totalPages = Math.ceil(result.totalItems / pagination.limit);

    return {
      code: 200,
      status: "success",
      success: true,
      message: "Successfully fetched vitals",
      data: result.data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalItems: result.totalItems,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrevious: pagination.page > 1,
      },
    };
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to get vitals",
    };
  }
}
