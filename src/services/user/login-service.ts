import { UserRepository } from "@/repositories/user.repository";
import { UserData } from "@/types/user";

export async function LoginService(data: Partial<UserData>) {
  const userRepository = new UserRepository();

  try {
    if (!data.email) {
      return { code: 400, status: "error", message: "Email is required" };
    }

    const userExist = await userRepository.findByEmail(data.email);

    if(!userExist) {
      return { code: 404, status: "error", message: "User does not exist" };
    }

    if(userExist.password !== data.password){
      return { code: 401, status: "error", message: "Wrong password" };
    }

    return { code: 200, status: "success", message: "Login Successfully" };
  } catch (error) {
    console.error(error);
    return { code: 500, status: "error", message: "Unable to login" };
  }
}