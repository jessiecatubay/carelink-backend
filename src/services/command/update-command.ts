import { CommandRepository } from "@/repositories/command.repository";
import { CommandData } from "@/types/user";

export async function UpdateLatestCommandService (data: CommandData) {
  const commandRepository = new CommandRepository();

  try {
    await commandRepository.updateByLatest(data);

    return {
      code: 200,
      status: "success",
      message: "Successfully updated latest command"
    }
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to update latest command"
    }
  }
}