import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "access-secret";

export type JwtPayload = {
  id: string;
  email?: string | null;
  role: string;
  type?: "access" | "refresh";
};

export interface TokenPayload {
  id: string;
  email: string | null;
  role?: string;
}

export const TOKEN_EXPIRY_DAYS = 7;
export const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export enum TokenExpiry {
  ACCESS_TOKEN_EXPIRES = "7d",
  REFRESH_TOKEN_EXPIRES = "7d",
}

export function generateAccessToken(user: TokenPayload) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role ?? "PATIENT" },
    JWT_SECRET,
    { expiresIn: TokenExpiry.ACCESS_TOKEN_EXPIRES },
  );
}

export function generateTokens(user: TokenPayload) {
  const accessToken = generateAccessToken(user);

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role ?? "PATIENT" },
    JWT_SECRET,
    { expiresIn: TokenExpiry.REFRESH_TOKEN_EXPIRES },
  );

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload & {
    iat?: number;
    exp?: number;
  };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as TokenPayload & {
    iat?: number;
    exp?: number;
  };
}
