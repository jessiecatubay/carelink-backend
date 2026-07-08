import { UserRepository } from "@/repositories/user.repository";
import { UserData } from "@/types/user"

export async function SignupService(data: UserData) {
  const userRepository = new UserRepository();
  
  try {
    await userRepository.create(data);

    return {
      code: 201,
      status: "success",
      message: "User created successfully" 
    }
  } catch (error) {
    console.error(error);
    return { code: 500, status: "error", message: "Unable to create account" }
  }
}