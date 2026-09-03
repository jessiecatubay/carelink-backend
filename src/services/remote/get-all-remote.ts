import { RemoteRepository } from "@/repositories/remote.repository";

export async function GetAllRemoteService() {
  const remoteRepository = new RemoteRepository();

  try {
    const data = await remoteRepository.findAll();

    return {
      code: 200,
      status: "success",
      message: "Successfully fetched data",
      data: data
    }
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to fetch data"
    }
  }
}