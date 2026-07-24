import {
  SignupService,
  LoginService,
  UpdateUserService,
} from "@/services/user";
import { Request, Response } from "express";
import { UserData } from "@/types/user";
import {
  generateTokens,
  verifyRefreshToken,
} from "@/middleware/auth.middleware";

export class UserController {
  public signup = async (req: Request, res: Response) => {
    const result = await SignupService(req.body);

    return res.status(result.code).json(result);
  };

  public login = async (req: Request, res: Response) => {
    const result = await LoginService(req.body);

    return res.status(result.code).json(result);
  };

  public refresh = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const payload = verifyRefreshToken(refreshToken);

      const tokens = generateTokens({
        id: payload.id,
        email: payload.email,
        role: payload.role ?? "PATIENT",
      });

      return res.status(200).json({
        code: 200,
        status: "success",
        message: "Tokens refreshed successfully",
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      return res
        .status(401)
        .json({
          code: 401,
          status: "error",
          message: "Invalid or expired refresh token",
        });
    }
  };

  public update = async (req: Request, res: Response) => {
    const { email, ...data }: { email: string } & Partial<UserData> = req.body;

    const result = await UpdateUserService(email, data);

    return res.status(result.code).json(result);
  };
}
