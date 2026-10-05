import {
  SignupService,
  LoginService,
  UpdateUserService,
  GetUserByIdService,
  GoogleAuthService,
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
  public update = async (req: AuthenticatedRequest, res: Response) => {
    const email = req.body?.email || req.user?.email;
    const data = { ...req.body };
    delete data.email;

    if (!email) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Email is required.",
      });
    }

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
    try {
      if (!req?.user?.id) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized. User information is missing.",
        });
      }

      const result = await GetMeService(req.user.id);

      if (!result) {
        return res.status(500).json({
          status: "error",
          message: "GetMeService returned no result.",
        });
      }

      return res.status(result.code).json(result);
    } catch (error) {
      console.error("GET /me controller error:", error);

      return res.status(500).json({
        status: "error",
        message: "Unable to retrieve current user.",
      });
    }
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

  public googleAuth = async (req: Request, res: Response) => {
    const { idToken } = req.body;

    const result = await GoogleAuthService(idToken);

    return res.status(result.code).json(result);
  };
}
