import { UserRepository } from "@/repositories/user.repository";
import { hashPassword, verifyPassword } from "@/utils/password";

export async function ChangePasswordService (id: string, newPassword: string, currentPassword: string) {
  console.log(id, newPassword, currentPassword);
  const userRepository = new UserRepository();

  const user = await userRepository.getById(id);

  if (user?.googleId && !user?.password) {
    return {
      code: 400,
      status: "error",
      message: "Accounts signed in with Google cannot change their password. Please manage your password through your Google account.",
    };
  }

  if (!user || !user.password) {
    return {
      code: 400,
      status: "error",
      message: "Unable to find user account or password not configured.",
    };
  }

  const isValid = verifyPassword(currentPassword, user.password);

  if (!isValid) {
    return {
      code: 400,
      status: "error",
      message: "Current password does not match your current password.",
    };
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