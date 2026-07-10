import { UserRepository } from "@/repositories/user.repository";
import { UserData } from "@/types/user";
import { verifyPassword } from "@/utils/password";

export async function LoginService(email: string, password: string) {
  const userRepository = new UserRepository();

  try {
    if (!email) {
      return { code: 400, status: "error", message: "Email is required" };
    }

    const user = await userRepository.findByEmail(email);

    if (!user || !user.password || !verifyPassword(password, user.password)) {
      return { code: 400, status: "error", message: "Invalid Credentials" };
    }

    return { code: 200, status: "success", message: "Login Successfully" };
  } catch (error) {
    console.error(error);
    return { code: 500, status: "error", message: "Unable to login" };
  }
}