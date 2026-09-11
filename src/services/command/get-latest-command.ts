import { CommandRepository } from "@/repositories/command.repository";

export async function GetLatestCommandService (nonPatientId: string) {
  const commandReposiotry = new CommandRepository();

  try {
    if (!nonPatientId) {
      return {
        code: 500,
        status: "error",
        message: "Missing nonPatientId",
      };
    }
    const result = await commandReposiotry.findLatest(nonPatientId);

    return {
      code: 200,
      status: "success",
      message: "Successfully fetched data",
      data: result
    }
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to fetch data"
    }
  }
}