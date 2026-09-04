import { CommandRepository } from "@/repositories/command.repository";

export async function GetAllCommandService() {
  const commandRepository = new CommandRepository();

  try {
    const data = await commandRepository.findAll();

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
