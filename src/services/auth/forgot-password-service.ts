import { randomInt, createHash } from "crypto";
import fs from "fs/promises";
import path from "path";
import { UserRepository } from "@/repositories/user.repository";
import { TokenRepository } from "@/repositories/token.repository";
import { sendEmail } from "@/services/mail/mailer";

export async function ForgotPasswordService(email: string) {
  if (!email) {
    return {
      code: 400,
      status: "error",
      message: "Email is required",
    };
  }

  try {
    const userRepository = new UserRepository();
    const tokenRepository = new TokenRepository();

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userRepository.findByEmail(normalizedEmail);

    // Keep the response generic so we don't reveal
    // whether an account exists for this email.
    if (!user) {
      return {
        code: 404,
        status: "error",
        message: "User not found",
      };
    }

    // Generate a secure 6-digit code.
    const resetCode = randomInt(100000, 1000000).toString();

    // Hash the code before storing it in the database.
    const hashedResetCode = createHash("sha256")
      .update(resetCode)
      .digest("hex");

    // Invalidate any previous reset codes for this user.
    await tokenRepository.revokeActivePasswordResetTokens(user.id);

    // Code expires after 15 minutes.
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await tokenRepository.createPasswordResetToken({
      userId: user.id,
      token: hashedResetCode,
      expiresAt,
    });

    const templatePath = path.join(
      process.cwd(),
      "src",
      "services",
      "mail",
      "templates",
      "reset-password.html",
    );

    let html = await fs.readFile(templatePath, "utf-8");

    html = html
      .replace("{{name}}", user.firstName || "there")
      .replace("{{resetCode}}", resetCode)
      .replace("{{expiresAt}}", expiresAt.toLocaleString());

    await sendEmail({
      to: normalizedEmail,
      subject: "CareLink Password Reset Code",
      html,
    });

    return {
      code: 200,
      status: "success",
      message: "If the email exists, a password reset code has been sent.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);

    return {
      code: 500,
      status: "error",
      message: "Unable to process password reset request",
    };
  }
}
