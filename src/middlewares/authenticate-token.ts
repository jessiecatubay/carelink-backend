import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RefreshTokenService } from "@/services/auth";
import {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export { generateTokens, verifyAccessToken, verifyRefreshToken };

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

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
      email: decoded.email ?? "",
      role: decoded.role,
    };

    // Access token is still valid
    next();
    return;
  } catch (error) {
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

    try {
      // 4. Refresh
      const result = await RefreshTokenService(refreshToken);

      if (result.code !== 200 || !result.data?.accessToken) {
        res.status(result.code).json(result);
        return;
      }

      const { accessToken, refreshToken: newRefreshToken, user } = result.data;

      // 5. Give frontend the new tokens
      res.setHeader("X-Access-Token", accessToken);

      if (typeof newRefreshToken === "string") {
        res.setHeader("X-Refresh-Token", newRefreshToken);
      }

      // 6. We already know who the user is
      req.user = {
        id: user.id,
        email: user.email ?? "",
        role: user.role,
      };

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
