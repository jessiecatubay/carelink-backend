import { UserRepository } from "@/repositories/user.repository";
import { UserData } from "@/types/user";
import { hashPassword } from "@/utils/password";

export async function SignupService(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  const userRepository = new UserRepository();

  const hashedPass = hashPassword(password);

  try {
    await userRepository.create({firstName, lastName, email, password: hashedPass});

    return {
      code: 201,
      status: "success",
      message: "User created successfully",
    };
  } catch (error) {
    console.error(error);
    return { code: 500, status: "error", message: "Unable to create account" };
  }
}
