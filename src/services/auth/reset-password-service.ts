import { TokenRepository } from "@/repositories/token.repository";
import { UserRepository } from "@/repositories/user.repository";
import { hashPassword } from "@/utils/password";

export async function ResetPasswordService(
  resetToken: string,
  newPassword: string,
) {
  if (!resetToken || !newPassword) {
    return {
      code: 400,
      status: "error",
      message: "Reset token and new password are required",
    };
  }

  try {
    const tokenRepository = new TokenRepository();
    const userRepository = new UserRepository();

    const passwordResetToken =
      await tokenRepository.findActivePasswordResetAuthorizationToken(
        resetToken,
      );

    if (!passwordResetToken) {
      return {
        code: 400,
        status: "error",
        message: "Invalid or expired password reset session",
      };
    }

    const hashedNewPassword = hashPassword(newPassword);

    await userRepository.changePassword(
      passwordResetToken.userId,
      hashedNewPassword,
    );

    await tokenRepository.consumeToken(
      passwordResetToken.id,
    );

    return {
      code: 200,
      status: "success",
      message: "Password successfully reset",
    };
  } catch (error) {
    console.error("Reset password error:", error);

    return {
      code: 500,
      status: "error",
      message: "Unable to reset password",
    };
  }
}