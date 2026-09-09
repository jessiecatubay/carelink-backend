import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RefreshTokenService } from "@/services/auth";

const JWT_SECRET = process.env.JWT_SECRET || "access-secret";

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
    JWT_SECRET,
    { expiresIn: "15s" },
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role ?? "PATIENT" },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    id: string;
    email: string;
    role?: string;
    iat?: number;
    exp?: number;
  };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    id: string;
    email: string;
    role?: string;
    iat?: number;
    exp?: number;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  console.log("Access authenticate token")

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    res.status(401).json({
      code: 401,
      status: "error",
      message: "Access token is required",
    });
    return;
  }

  try {
    // 1. Try access token
    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    // Access token is still valid
    next();
    return;

  } catch (error) {
    console.log("if token expired")

    // 2. Access token expired
    if (!(error instanceof jwt.TokenExpiredError)) {
      res.status(401).json({
        code: 401,
        status: "error",
        message: "Invalid access token",
      });
      return;
    }

    // 3. Get refresh token
    const refreshToken =
      req.header("X-Refresh-Token") ??
      req.body?.refreshToken ??
      req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        code: 401,
        status: "error",
        message: "Refresh token is required; login is required",
      });
      return;
    }

    console.log("gikuha ang refresh token", refreshToken);

    try {
      // 4. Refresh
      const result = await RefreshTokenService(refreshToken);
      console.log("nagpa buhat ug bag o refreshtoken", refreshToken);

      if (result.code !== 200 || !result.data?.accessToken) {
        res.status(result.code).json(result);
        return;
      }

      const {
        accessToken,
        refreshToken: newRefreshToken,
        user,
      } = result.data;

      // 5. Give frontend the new tokens
      res.setHeader("X-Access-Token", accessToken);
      console.log("gibutang sa auth header")

      if (typeof newRefreshToken === "string") {
        res.setHeader("X-Refresh-Token", newRefreshToken);
      }

      // 6. We already know who the user is
      req.user = {
        id: user.id,
        email: user.email ?? "",
        role: user.role,
      };

      console.log("kaila sad tas user", req.user);

      // 7. Continue to /me
      next();
      return;

    } catch {
      res.status(401).json({
        code: 401,
        status: "error",
        message: "Invalid or expired refresh token; login is required",
      });
      return;
    }
  }
}