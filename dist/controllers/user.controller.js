import { SignupService, LoginService, UpdateUserService, GetUserByIdService, } from "@/services/user";
import { UserOnboardingService } from "@/services/user/user-onboarding-service";
import { RefreshTokenService } from "@/services/auth";
import { GetMeService } from "@/services/auth/get-me-service";
export class UserController {
    getById = async (req, res) => {
        const { id } = req.body;
        console.log(id);
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
        const { email, ...data } = req.body;
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
        if (!req?.user?.id)
            return;
        const result = await GetMeService(req.user.id);
        return res.status(result.code).json(result);
    };
}
//# sourceMappingURL=user.controller.js.map