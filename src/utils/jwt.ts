import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret";

export interface TokenPayload {
  id: string;
  email: string;
  role?: string;
}

export function generateTokens(user: TokenPayload) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role ?? "PATIENT" },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role ?? "PATIENT" },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload & {
    iat?: number;
    exp?: number;
  };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload & {
    iat?: number;
    exp?: number;
  };
}
