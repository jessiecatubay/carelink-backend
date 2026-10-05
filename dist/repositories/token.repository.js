import { prisma } from "@/lib/prisma";
import { TokenType } from "@/generated/prisma/enums";
export class TokenRepository {
    async createEmailVerificationToken(params) {
        const { userId, token, expiresAt } = params;
        return prisma.token.create({
            data: {
                userId,
                token,
                expiresAt,
                type: TokenType.EMAIL_VERIFY,
            },
        });
    }
    async createRefreshToken(params) {
        const { userId, token, expiresAt } = params;
        return prisma.token.create({
            data: {
                userId,
                token,
                expiresAt,
                type: TokenType.REFRESH,
            },
        });
    }
    async findActiveRefreshToken(token) {
        return prisma.token.findFirst({
            where: {
                token,
                type: TokenType.REFRESH,
                consumedAt: null,
                revokedAt: null,
            },
        });
    }
    async findActiveEmailVerificationToken(token) {
        return prisma.token.findFirst({
            where: {
                token,
                type: TokenType.EMAIL_VERIFY,
                consumedAt: null,
                revokedAt: null,
            },
        });
    }
    async findLatestEmailVerificationTokenByUser(userId) {
        return prisma.token.findFirst({
            where: {
                userId,
                type: TokenType.EMAIL_VERIFY,
                consumedAt: null,
                revokedAt: null,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async consumeToken(id) {
        return prisma.token.update({
            where: { id },
            data: { consumedAt: new Date() },
        });
    }
    async revokeToken(id) {
        return prisma.token.update({
            where: { id },
            data: { revokedAt: new Date() },
        });
    }
    async createPasswordResetToken(params) {
        const { userId, token, expiresAt } = params;
        return prisma.token.create({
            data: {
                userId,
                token,
                expiresAt,
                type: TokenType.PASSWORD_RESET,
            },
        });
    }
    async revokeActivePasswordResetTokens(userId) {
        return prisma.token.updateMany({
            where: {
                userId,
                type: TokenType.PASSWORD_RESET,
                consumedAt: null,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }
    async findActivePasswordResetToken(token) {
        return prisma.token.findFirst({
            where: {
                token,
                type: TokenType.PASSWORD_RESET,
                consumedAt: null,
                revokedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
    }
    async createPasswordResetAuthorizationToken(params) {
        const { userId, token, expiresAt } = params;
        return prisma.token.create({
            data: {
                userId,
                token,
                expiresAt,
                type: TokenType.PASSWORD_RESET,
            },
        });
    }
    async findActivePasswordResetAuthorizationToken(token) {
        return prisma.token.findFirst({
            where: {
                token,
                type: TokenType.PASSWORD_RESET,
                consumedAt: null,
                revokedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
    }
}
//# sourceMappingURL=token.repository.js.map