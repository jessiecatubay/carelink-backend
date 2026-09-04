import { CommandRepository } from "@/repositories/command.repository";
import { Command } from "@/generated/prisma/enums";

export async function CreateCommandService(deviceId: string, command: Command) {
  const commandRepository = new CommandRepository();

  try {
    const result = await commandRepository.create({ deviceId, command });

    return {
      code: 201,
      status: "success",
      message: "Successfully added command data",
      data: result
    };
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to added command data",
    };
  }
}
