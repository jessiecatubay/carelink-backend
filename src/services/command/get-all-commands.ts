import { CommandRepository } from "@/repositories/command.repository";

export async function GetAllCommandService(nonPatientId: string) {
  const commandRepository = new CommandRepository();

  try {
    if (!nonPatientId) {
      return {
        code: 500,
        status: "error",
        message: "Missing nonPatientId",
      };
    }
    const data = await commandRepository.findAll(nonPatientId);

    return {
      code: 200,
      status: "success",
      message: "Successfully fetched data",
      data: data,
    };
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to fetch data",
    };
  }
}
