import { UserRepository } from "@/repositories/user.repository";
import { LoginInput } from "@/types/user";
import { generateTokens, TOKEN_EXPIRY_MS, TokenExpiry } from "@/utils/jwt";
import { verifyPassword } from "@/utils/password";
import { TokenRepository } from "@/repositories/token.repository";

export async function LoginService(input: LoginInput) {
  const userRepository = new UserRepository();

  try {
    const user = await userRepository.findByEmail(input.email);

    if (
      !user ||
      !user.password ||
      !verifyPassword(input.password, user.password)
    ) {
      return { code: 400, status: "error", message: "Invalid Credentials" };
    }

    if (!user.emailVerified) {
      return {
        code: 403,
        status: "error",
        emailVerified: false,
        message: "Please verify your email address before logging in.",
      };
    }

    const tokens = generateTokens({
      id: user.id,
      email: user.email ?? input.email,
      role: user.role ?? "PATIENT",
    });

    await new TokenRepository().createRefreshToken({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
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
          onBoarded: user.onBoarded,
          emergencyContact: user.nonPatientProfile?.emergencyContact,
          googleId: user.googleId,
          hasPassword: Boolean(user.password),
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: TokenExpiry.ACCESS_TOKEN_EXPIRES,
        refreshExpiresIn: TokenExpiry.REFRESH_TOKEN_EXPIRES,
      },
    };
  } catch (error) {
    console.error(error);
    return { code: 500, status: "error", message: "Unable to login" };
  }
}
