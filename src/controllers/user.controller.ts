import {
  SignupService,
  LoginService,
  UpdateUserService,
  GetUserByIdService,
} from "@/services/user";
import { UserOnboardingService } from "@/services/user/user-onboarding-service";
import { Request, Response } from "express";
import { UserData } from "@/types/user";
import {
  RefreshTokenService,
  ChangePasswordService,
  ForgotPasswordService,
  ResetPasswordService,
  VerifyResetCodeService,
} from "@/services/auth";
import { GetMeService } from "@/services/auth/get-me-service";
import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import {
  CreateEmailVerificationService,
  VerifyEmailService,
  ResendEmailVerificationService,
} from "@/services/auth";

export class UserController {
  public getById = async (req: Request, res: Response) => {
    const { id } = req.body;
    console.log("fasdfasf", id);

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
    return res.status(result!.code).json(result);
  };

  public changePassword = async (req: AuthenticatedRequest, res: Response) => {
    const { id, newPassword, currentPassword } = req.body;

    const result = await ChangePasswordService(
      id,
      newPassword,
      currentPassword,
    );

    return res.status(result.code).json(result);
  };

  public forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await ForgotPasswordService(email);

    return res.status(result.code).json(result);
  };

  public resetPassword = async (req: Request, res: Response) => {
    const { resetToken, newPassword } = req.body;

    const result = await ResetPasswordService(resetToken, newPassword);

    return res.status(result.code).json(result);
  };

  public verifyResetCode = async (req: Request, res: Response) => {
    const { email, resetCode } = req.body;

    const result = await VerifyResetCodeService(email, resetCode);

    return res.status(result.code).json(result);
  };

  public verifyEmail = async (req: Request, res: Response) => {
    const { email, verificationCode } = req.body;
    console.log(req.body);

    const result = await VerifyEmailService(email, verificationCode);

    return res.status(result.code).json(result);
  };

  public resendEmailVerification = async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await ResendEmailVerificationService(email);

    return res.status(result.code).json(result);
  };
}
