import { UserRepository } from "@/repositories/user.repository";
import { hashPassword } from "@/utils/password";
import { CreateEmailVerificationService } from "@/services/auth/verify-email-service";

export async function SignupService(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) {
  const userRepository = new UserRepository();

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await userRepository.findByEmail(
      normalizedEmail,
    );

    if (existingUser) {
      return {
        code: 409,
        status: "error",
        message: "Email already exists",
      };
    }

    const hashedPass = hashPassword(password);

    const user = await userRepository.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPass,
    });

    const verificationResult =
      await CreateEmailVerificationService(user.id);

    if (verificationResult.code !== 200) {
      return {
        code: 500,
        status: "error",
        message:
          "Account was created, but we were unable to send the verification email.",
      };
    }

    return {
      code: 201,
      status: "success",
      message:
        "User created successfully. A verification code has been sent to your email.",
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          onBoarded: user.onBoarded,
          emailVerified: user.emailVerified,
        },
      },
    };
  } catch (error) {
    console.error("Signup error:", error);

    return {
      code: 500,
      status: "error",
      message: "Unable to create account",
    };
  }
}