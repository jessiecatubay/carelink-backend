import { RemoteRepository } from "@/repositories/remote.repository";
import { RemoteData } from "@/types/user";
import { Command } from "@/generated/prisma/enums";

export async function CreateCommandService(
  deviceId: string,
  command: Command,
) {
  const remoteRepository = new RemoteRepository();

  try {
    await remoteRepository.create({ deviceId, command });

    return {
      code: 200,
      status: "success",
      message: "Successfully added remote data"
    }
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to added remote data"
    }
  }
}
