import { UserRepository } from "@/repositories/user.repository";
import { TokenRepository } from "@/repositories/token.repository";
import { generateTokens, TokenExpiry, verifyRefreshToken } from "@/utils/jwt";

export async function RefreshTokenService(refreshToken?: string) {
  if (!refreshToken) {
    return {
      code: 401,
      status: "error",
      message: "Refresh token is required",
    };
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return {
      code: 401,
      status: "error",
      message: "Invalid or expired refresh token",
    };
  }

  // 1. Verify JWT signature and type
  if (!payload) {
    return {
      code: 401,
      status: "error",
      message: "Invalid or expired refresh token",
    };
  }

  const tokenRepository = new TokenRepository();
  const userRepository = new UserRepository();

  // 2. Check Database for the token (to verify it's not consumed/revoked)
  const dbToken = await tokenRepository.findActiveRefreshToken(refreshToken);
  if (!dbToken) {
    return {
      code: 401,
      status: "error",
      message: "Token is no longer valid or has been used",
    };
  }

  // 3. Verify user still exists
  const user = await userRepository.getById(payload.id);
  if (!user) {
    return { code: 404, status: "error", message: "User not found" };
  }

  // 4. Token Rotation: Consume the old token and generate a new pair
  await tokenRepository.consumeToken(dbToken.id);

  const tokens = generateTokens({
    id: user.id,
    email: user.email,
    role: user.role ?? "PATIENT",
  });

  // 5. Store the new refresh token
  await tokenRepository.createRefreshToken({
    userId: user.id,
    token: tokens.refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return {
    code: 200,
    status: "success",
    message: "Session refreshed",
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: TokenExpiry.ACCESS_TOKEN_EXPIRES,
      refreshExpiresIn: TokenExpiry.REFRESH_TOKEN_EXPIRES,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    },
  };
}
