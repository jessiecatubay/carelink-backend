import { UserRepository } from "@/repositories/user.repository";
import { generateTokens } from "@/utils/jwt";
import { verifyPassword } from "@/utils/password";

export async function LoginService(email: string, password: string) {
  const userRepository = new UserRepository();

  try {
    if (!email) {
      return { code: 400, status: "error", message: "Email is required" };
    }

    const user = await userRepository.findByEmail(email);

    if (!user || !user.password || !verifyPassword(password, user.password)) {
      return { code: 400, status: "error", message: "Invalid Credentials" };
    }

    const tokens = generateTokens({
      id: user.id,
      email: user.email ?? email,
      role: user.role ?? "PATIENT",
    });

    return {
      code: 200,
      status: "success",
      message: "Login successfully",
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
    return { code: 500, status: "error", message: "Unable to login" };
  }
}
