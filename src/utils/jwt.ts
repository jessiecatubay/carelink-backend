import jwt from "jsonwebtoken";
import { TokenRepository } from "@/repositories/token.repository";

const JWT_SECRET = process.env.JWT_SECRET || "access-secret";

export type JwtPayload = {
  id: string;
  role: string;
  type: "access" | "refresh";
};

export interface TokenPayload {
  id: string;
  email: string | null;
  role?: string;
}

export enum TokenExpiry {
  ACCESS_TOKEN_EXPIRES = "15m",
  REFRESH_TOKEN_EXPIRES = "7d",
}

export function generateAccessToken(user: TokenPayload) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role ?? "PATIENT" },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function generateTokens(user: TokenPayload) {
  const tokenRepository = new TokenRepository();
  const accessToken = generateAccessToken(user);

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role ?? "PATIENT" },
    JWT_SECRET,
    { expiresIn: "7d" },
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
