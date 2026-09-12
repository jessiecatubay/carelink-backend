import { UserRepository } from "@/repositories/user.repository";
import { generateTokens } from "@/utils/jwt";
import { hashPassword } from "@/utils/password";
import { TokenRepository } from "@/repositories/token.repository";

export async function SignupService(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) {
  const userRepository = new UserRepository();

  try {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      return { code: 409, status: "error", message: "Email already exists" };
    }

    const hashedPass = hashPassword(password);
    const user = await userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPass,
    });

    const tokens = generateTokens({
      id: user.id,
      email: user.email ?? email,
      role: user.role ?? "PATIENT",
    });

    await new TokenRepository().createRefreshToken({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
          onBoarded: user.onBoarded,
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
