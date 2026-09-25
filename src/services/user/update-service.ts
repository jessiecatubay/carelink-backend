import { UserRepository } from "@/repositories/user.repository";
import { UserData } from "@/types/user";

export async function UpdateUserService(email: string, data: UserData) {
  const userRepository = new UserRepository();

  try {
    await userRepository.update(email, data);

    return {
      code: 200,
      status: "success",
      message: "User updated successfully"
    }
  } catch (error) {
    console.error(error);
    return { code: 500, status: "error", message: "Unable to update account" }
  }
}