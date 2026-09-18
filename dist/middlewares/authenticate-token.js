import jwt from "jsonwebtoken";
import { RefreshTokenService } from "@/services/auth";
const JWT_SECRET = process.env.JWT_SECRET || "access-secret";
export function generateTokens(user) {
    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role ?? "PATIENT" }, JWT_SECRET, { expiresIn: "15s" });
    const refreshToken = jwt.sign({ id: user.id, email: user.email, role: user.role ?? "PATIENT" }, JWT_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}
export function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
export async function authenticateToken(req, res, next) {
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
            email: decoded.email,
            role: decoded.role,
        };
        // Access token is still valid
        next();
        return;
    }
    catch (error) {
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
        const refreshToken = req.header("X-Refresh-Token") ??
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
        }
        catch {
            res.status(401).json({
                code: 401,
                status: "error",
                message: "Invalid or expired refresh token; login is required",
            });
            return;
        }
    }
}
//# sourceMappingURL=authenticate-token.js.map