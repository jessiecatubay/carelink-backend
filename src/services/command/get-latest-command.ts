import { CommandRepository } from "@/repositories/command.repository";

export async function GetLatestCommandService () {
  const commandReposiotry = new CommandRepository();

  try {
    const result = await commandReposiotry.findLatest();

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