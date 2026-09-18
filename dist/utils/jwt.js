import jwt from "jsonwebtoken";
import { TokenRepository } from "@/repositories/token.repository";
const JWT_SECRET = process.env.JWT_SECRET || "access-secret";
export var TokenExpiry;
(function (TokenExpiry) {
    TokenExpiry["ACCESS_TOKEN_EXPIRES"] = "7d";
    TokenExpiry["REFRESH_TOKEN_EXPIRES"] = "7d";
})(TokenExpiry || (TokenExpiry = {}));
export function generateAccessToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role ?? "PATIENT" }, JWT_SECRET, { expiresIn: "7d" });
}
export function generateTokens(user) {
    const tokenRepository = new TokenRepository();
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign({ id: user.id, email: user.email, role: user.role ?? "PATIENT" }, JWT_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}
export function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
//# sourceMappingURL=jwt.js.map