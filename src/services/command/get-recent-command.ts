import { CommandRepository } from "@/repositories/command.repository";

export async function GetRecentCommandService(nonPatientId: string) {
  const commandRepository = new CommandRepository();

  try {
    if (!nonPatientId) {
      return {
        code: 500,
        status: "error",
        message: "Missing nonPatientId",
      };
    }
    
    const result = await commandRepository.findRecent(nonPatientId);

    return {
      code: 200,
      status: "success",
      message: "Successfully fetched recent data",
      data: result,
    };
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to fetch recent data",
    };
  }
}
