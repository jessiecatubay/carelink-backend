import { createHash, randomBytes } from "crypto";
import { UserRepository } from "@/repositories/user.repository";
import { TokenRepository } from "@/repositories/token.repository";

export async function VerifyResetCodeService(email: string, resetCode: string) {
  if (!email || !resetCode) {
    return {
      code: 400,
      status: "error",
      message: "Email and reset code are required",
    };
  }

  try {
    const userRepository = new UserRepository();
    const tokenRepository = new TokenRepository();

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user) {
      return {
        code: 400,
        status: "error",
        message: "Invalid or expired reset code",
      };
    }

    const hashedResetCode = createHash("sha256")
      .update(resetCode)
      .digest("hex");

    const resetToken =
      await tokenRepository.findActivePasswordResetToken(hashedResetCode);

    if (!resetToken || resetToken.userId !== user.id) {
      return {
        code: 400,
        status: "error",
        message: "Invalid or expired reset code",
      };
    }

    const resetAuthorizationToken = randomBytes(32).toString("hex");

    const authorizationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await tokenRepository.createPasswordResetAuthorizationToken({
      userId: user.id,
      token: resetAuthorizationToken,
      expiresAt: authorizationExpiresAt,
    });

    await tokenRepository.consumeToken(resetToken.id);

    return {
      code: 200,
      status: "success",
      message: "Reset code verified",
      resetToken: resetAuthorizationToken,
    };
  } catch (error) {
    console.error("Verify reset code error:", error);

    return {
      code: 500,
      status: "error",
      message: "Unable to verify reset code",
    };
  }
}
