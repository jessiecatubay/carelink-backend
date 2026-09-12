import { CommandRepository } from "@/repositories/command.repository";
import { PaginationParams } from "@/utils/pagination";

export async function GetAllCommandService(
  nonPatientId: string,
  pagination: PaginationParams,
) {
  const commandRepository = new CommandRepository();

  try {
    if (!nonPatientId) {
      return {
        code: 500,
        status: "error",
        message: "Missing nonPatientId",
      };
    }
    const result = await commandRepository.findAll(nonPatientId, pagination);
    const totalPages = Math.ceil(result.totalItems / pagination.limit);

    return {
      code: 200,
      status: "success",
      success: true,
      message: "Successfully fetched data",
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
      message: "Unable to fetch data",
    };
  }
}
