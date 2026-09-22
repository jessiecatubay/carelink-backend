import { UserRepository } from "@/repositories/user.repository";
import { hashPassword, verifyPassword } from "@/utils/password";

export async function ChangePasswordService (id: string, newPassword: string, currentPassword: string) {
  console.log(id, newPassword, currentPassword);
  const userRepository = new UserRepository();

  const user = await userRepository.getById(id);

  if(!user?.password) return {
    code: 500,
    status: "error",
    message: "No user"
  }

  const isValid = verifyPassword(currentPassword, user?.password);

  if(!isValid) return {
    code: 500,
    status: "error",
    message: "Current password doesnt match with stored password"
  }

  const hashedNewPass = hashPassword(newPassword);
  console.log(hashedNewPass);

  try {
    await userRepository.changePassword(id, hashedNewPass);

    return {
      code: 200,
      status: "success",
      message: "Successfully changed password"
    }
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to change password",
    }
  }
}