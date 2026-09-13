import {
  SignupService,
  LoginService,
  UpdateUserService,
  GetUserByIdService,
} from "@/services/user";
import { UserOnboardingService } from "@/services/user/user-onboarding-service";
import { Request, Response } from "express";
import { UserData } from "@/types/user";
import { RefreshTokenService } from "@/services/auth";
import { GetMeService } from "@/services/auth/get-me-service";
import { AuthenticatedRequest } from "@/middlewares/authenticate-token";

export class UserController {
  public getById = async (req: Request, res: Response) => {
    const { id } = req.body;
    console.log(id);

    const result = await GetUserByIdService(id);

    return res.status(result.code).json(result);
  };

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
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    const result = await RefreshTokenService(refreshToken);

    return res.status(result.code).json(result);
  };
  public update = async (req: Request, res: Response) => {
    const { email, ...data }: { email: string } & Partial<UserData> = req.body;

    const result = await UpdateUserService(email, data);

    return res.status(result.code).json(result);
  };

  public onBoarded = async (req: Request, res: Response) => {
    const { userId, role, ...data } = req.body;
    if (role === "NON-PATIENT") {
      const nonPatientRole = "NON_PATIENT";
      const result = await UserOnboardingService(userId, nonPatientRole, data);

      return res.status(result.code).json(result);
    }
    console.log("User onboarding", req.body);
    const roleUpper = typeof role === "string" ? role.toUpperCase() : role;

    const result = await UserOnboardingService(userId, roleUpper, data);

    return res.status(result.code).json(result);
  };

  public me = async (req: AuthenticatedRequest, res: Response) => {
    if (!req?.user?.id) return;
    const result = await GetMeService(req.user.id);
    return res.status(result.code).json(result);
  };
}
