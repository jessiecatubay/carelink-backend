import {
  SignupService,
  LoginService,
  UpdateUserService,
} from "@/services/user";
import { UserOnboardingService } from "@/services/user/user-onboarding-service";
import { Request, Response } from "express";
import { UserData } from "@/types/user";
import {
  generateTokens,
  verifyRefreshToken,
} from "@/middleware/auth.middleware";

export class UserController {
  public signup = async (req: Request, res: Response) => {
    const { firstName, lastName, email, password } = req.body;
    const result = await SignupService(firstName, lastName, email, password);

    return res.status(result.code).json(result);
  };

  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await LoginService({ email, password });

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
      return res.status(401).json({
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

  public onBoarded = async (req: Request, res: Response) => {
    const { email, role } = req.body;
    const roleUpper = typeof role === "string" ? role.toUpperCase() : role;

    const result = await UserOnboardingService(email, roleUpper);

    return res.status(result.code).json(result);
  };
}
