import { randomInt, createHash } from "crypto";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/services/mail/mailer";

function generateVerificationCode() {
  return randomInt(100000, 1000000).toString();
}

export async function CreateEmailVerificationService(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return {
        code: 404,
        status: "error",
        message: "User not found.",
      };
    }

    if (!user.email) {
      return {
        code: 400,
        status: "error",
        message: "User does not have an email address.",
      };
    }

    if (user.emailVerified) {
      return {
        code: 400,
        status: "error",
        message: "Email address is already verified.",
      };
    }

    // Invalidate any previous email verification codes.
    await prisma.token.updateMany({
      where: {
        userId,
        type: "EMAIL_VERIFY",
        consumedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // Generate a secure 6-digit verification code.
    const verificationCode = generateVerificationCode();

    // Hash the code before storing it in the database.
    const hashedVerificationCode = createHash("sha256")
      .update(verificationCode)
      .digest("hex");

    // Code expires after 15 minutes.
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.token.create({
      data: {
        userId,
        type: "EMAIL_VERIFY",
        token: hashedVerificationCode,
        expiresAt,
      },
    });

    // Load the email template.
    const templatePath = path.join(
      process.cwd(),
      "src",
      "services",
      "mail",
      "templates",
      "verify-email.html",
    );

    let html = await fs.readFile(templatePath, "utf-8");

    // Replace template placeholders.
    html = html
      .replace("{{name}}", user.firstName || "there")
      .replace("{{verificationCode}}", verificationCode)
      .replace("{{expiresAt}}", expiresAt.toLocaleString());

    await sendEmail({
      to: user.email,
      subject: "Verify your CareLink email",
      html,
    });

    return {
      code: 200,
      status: "success",
      message: "Verification code sent successfully.",
    };
  } catch (error) {
    console.error("Create email verification error:", error);

    return {
      code: 500,
      status: "error",
      message: "Unable to send verification email.",
    };
  }
}

export async function VerifyEmailService(
  email: string,
  verificationCode: string,
) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return {
        code: 404,
        status: "error",
        message: "User not found.",
      };
    }

    if (user.emailVerified) {
      return {
        code: 400,
        status: "error",
        message: "Email address is already verified.",
      };
    }

    // Hash the code entered by the user.
    const hashedVerificationCode = createHash("sha256")
      .update(verificationCode)
      .digest("hex");

    const token = await prisma.token.findFirst({
      where: {
        userId: user.id,
        type: "EMAIL_VERIFY",
        token: hashedVerificationCode,
        consumedAt: null,
        revokedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!token) {
      return {
        code: 400,
        status: "error",
        message: "Invalid verification code.",
      };
    }

    if (token.expiresAt < new Date()) {
      return {
        code: 400,
        status: "error",
        message: "Verification code has expired.",
      };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: true,
        },
      }),

      prisma.token.update({
        where: {
          id: token.id,
        },
        data: {
          consumedAt: new Date(),
        },
      }),
    ]);

    return {
      code: 200,
      status: "success",
      message: "Email verified successfully.",
    };
  } catch (error) {
    console.error("Verify email error:", error);

    return {
      code: 500,
      status: "error",
      message: "Unable to verify email.",
    };
  }
}

export async function ResendEmailVerificationService(email: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return {
        code: 404,
        status: "error",
        message: "User not found.",
      };
    }

    if (user.emailVerified) {
      return {
        code: 400,
        status: "error",
        message: "Email address is already verified.",
      };
    }

    return CreateEmailVerificationService(user.id);
  } catch (error) {
    console.error("Resend email verification error:", error);

    return {
      code: 500,
      status: "error",
      message: "Unable to resend verification email.",
    };
  }
}