import { UserRepository } from "@/repositories/user.repository";
import type { SignupInput } from "@/schema/auth.schema";
import { generateTokens } from "@/middleware/auth.middleware";
import { hashPassword } from "@/utils/password";

export async function SignupService(input: SignupInput) {
  const userRepository = new UserRepository();

  try {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      return { code: 409, status: "error", message: "Email already exists" };
    }

    const hashedPass = hashPassword(input.password);
    const user = await userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: hashedPass,
    });

    const tokens = generateTokens({
      id: user.id,
      email: user.email ?? input.email,
      role: user.role ?? "PATIENT",
    });

    return {
      code: 201,
      status: "success",
      message: "User created successfully",
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  } catch (error) {
    console.error(error);
    return { code: 500, status: "error", message: "Unable to create account" };
  }
}
