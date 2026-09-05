import { UserRepository } from "@/repositories/user.repository";

export async function GetUserByIdService(id: string) {
  const userRepository = new UserRepository();

  try {
    const result = await userRepository.getById(id);

    return {
      code: 200,
      status: "success",
      message: "Successfully fetched user by id",
      data: result
    }
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to fetch user by id"
    }
  }
}