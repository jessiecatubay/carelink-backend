import { CommandRepository } from "@/repositories/command.repository";

export async function GetRecentCommandService() {
  const commandRepository = new CommandRepository();

  try {
    const result = await commandRepository.findRecent();

    return {
      code: 200,
      status: "success",
      message: "Successfully fetched recent data",
      data: result
    }
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to fetch recent data"
    }
  }
}