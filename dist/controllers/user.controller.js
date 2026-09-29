import { SignupService, LoginService, UpdateUserService, GetUserByIdService, GoogleAuthService, } from "@/services/user";
import { UserOnboardingService } from "@/services/user/user-onboarding-service";
import { RefreshTokenService, ChangePasswordService, ForgotPasswordService, ResetPasswordService, VerifyResetCodeService, } from "@/services/auth";
import { GetMeService } from "@/services/auth/get-me-service";
import { VerifyEmailService, ResendEmailVerificationService, } from "@/services/auth";
export class UserController {
    getById = async (req, res) => {
        const { id } = req.body;
        console.log("fasdfasf", id);
        const result = await GetUserByIdService(id);
        return res.status(result.code).json(result);
    };
    signup = async (req, res) => {
        const { firstName, lastName, email, password } = req.body;
        const result = await SignupService(firstName, lastName, email, password);
        return res.status(result.code).json(result);
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const result = await LoginService({ email, password });
        return res.status(result.code).json(result);
    };
    refresh = async (req, res) => {
        const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
        const result = await RefreshTokenService(refreshToken);
        return res.status(result.code).json(result);
    };
    update = async (req, res) => {
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
    onBoarded = async (req, res) => {
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
    me = async (req, res) => {
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
        }
        catch (error) {
            console.error("GET /me controller error:", error);
            return res.status(500).json({
                status: "error",
                message: "Unable to retrieve current user.",
            });
        }
    };
    changePassword = async (req, res) => {
        const { id, newPassword, currentPassword } = req.body;
        const result = await ChangePasswordService(id, newPassword, currentPassword);
        return res.status(result.code).json(result);
    };
    forgotPassword = async (req, res) => {
        const { email } = req.body;
        const result = await ForgotPasswordService(email);
        return res.status(result.code).json(result);
    };
    resetPassword = async (req, res) => {
        const { resetToken, newPassword } = req.body;
        const result = await ResetPasswordService(resetToken, newPassword);
        return res.status(result.code).json(result);
    };
    verifyResetCode = async (req, res) => {
        const { email, resetCode } = req.body;
        const result = await VerifyResetCodeService(email, resetCode);
        return res.status(result.code).json(result);
    };
    verifyEmail = async (req, res) => {
        const { email, verificationCode } = req.body;
        console.log(req.body);
        const result = await VerifyEmailService(email, verificationCode);
        return res.status(result.code).json(result);
    };
    resendEmailVerification = async (req, res) => {
        const { email } = req.body;
        const result = await ResendEmailVerificationService(email);
        return res.status(result.code).json(result);
    };
    googleAuth = async (req, res) => {
        const { idToken } = req.body;
        const result = await GoogleAuthService(idToken);
        return res.status(result.code).json(result);
    };
}
//# sourceMappingURL=user.controller.js.map