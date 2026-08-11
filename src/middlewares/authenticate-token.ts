import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export function generateTokens(user: {
  id: string;
  email: string;
  role?: string;
}) {
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
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as {
    id: string;
    email: string;
    role?: string;
    iat?: number;
    exp?: number;
  };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as {
    id: string;
    email: string;
    role?: string;
    iat?: number;
    exp?: number;
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({
        code: 401,
        status: "error",
        message: "Access token is required",
      });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({
        code: 401,
        status: "error",
        message: "Invalid or expired access token",
      });
  }
}
