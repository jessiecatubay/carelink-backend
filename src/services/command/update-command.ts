import { CommandRepository } from "@/repositories/command.repository";
import { CommandData } from "@/types/user";

export async function UpdateLatestCommandService(
  nonPatientId: string,
  data: Partial<CommandData>,
) {
  const commandRepository = new CommandRepository();

  try {
    const updated = await commandRepository.updateByLatest(nonPatientId, data);

    if (!updated) {
      return {
        code: 404,
        status: "error",
        message: "No command found",
      };
    }

    return {
      code: 200,
      status: "success",
      message: "Successfully updated latest command",
      data: updated,
    };
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to update latest command",
    };
  }
}
