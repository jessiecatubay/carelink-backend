import { prisma } from "../lib/prisma.js";
import { capitalizeWords } from "../utils/string.js";
export class UserRepository {
    async getById(id) {
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                password: true,
                role: true,
            },
        });
        if (user?.role === "NON_PATIENT") {
            return await prisma.user.findUnique({
                where: {
                    id,
                },
                include: {
                    nonPatientProfile: true,
                    nonPatientConnections: {
                        where: {
                            status: "CONNECTED",
                        },
                        include: {
                            patient: {
                                include: {
                                    patientProfile: true,
                                },
                            },
                        },
                    },
                },
            });
        }
        if (user?.role === "PATIENT") {
            return await prisma.user.findUnique({
                where: {
                    id,
                },
                include: {
                    patientProfile: true,
                    patientConnections: {
                        where: {
                            status: "CONNECTED",
                        },
                        include: {
                            nonPatient: {
                                include: {
                                    nonPatientProfile: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
            });
        }
        return await prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                patientProfile: true,
                nonPatientProfile: true,
            },
        });
    }
    async create(data) {
        const formattedData = {
            ...data,
            firstName: data.firstName ? capitalizeWords(data.firstName) : data.firstName,
            lastName: data.lastName ? capitalizeWords(data.lastName) : data.lastName,
        };
        return await prisma.user.create({
            data: formattedData,
            include: {
                patientProfile: true,
                nonPatientProfile: true,
            },
        });
    }
    async findByEmail(email) {
        return await prisma.user.findFirst({
            where: {
                email,
            },
            include: {
                patientProfile: true,
                nonPatientProfile: true,
            },
        });
    }
    async findByGoogleId(googleId) {
        return await prisma.user.findUnique({
            where: {
                googleId,
            },
            include: {
                patientProfile: true,
                nonPatientProfile: true,
            },
        });
    }
    async linkGoogleAccount(userId, googleId) {
        return await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                googleId,
                emailVerified: true,
            },
            include: {
                patientProfile: true,
                nonPatientProfile: true,
            },
        });
    }
    async getUserByCode(connectionCode) {
        return await prisma.patientProfile.findUnique({
            where: {
                connectionCode,
            },
            select: {
                userId: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }
    async update(email, data) {
        const userType = await prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                role: true,
            },
        });
        if (userType?.role === "PATIENT") {
            await prisma.patientProfile.upsert({
                where: {
                    userId: userType.id,
                },
                update: data,
                create: {
                    userId: userType.id,
                    ...data,
                },
            });
        }
        else if (userType?.role === "NON_PATIENT") {
            const formattedContactName = data.emergencyContactName !== undefined ? capitalizeWords(data.emergencyContactName) : undefined;
            const formattedRel = data.relationship !== undefined ? capitalizeWords(data.relationship) : undefined;
            await prisma.nonPatientProfile.upsert({
                where: {
                    userId: userType.id,
                },
                update: {
                    emergencyContact: data.emergencyContact,
                    emergencyContactName: formattedContactName,
                    relationship: formattedRel,
                },
                create: {
                    userId: userType.id,
                    emergencyContact: data.emergencyContact,
                    emergencyContactName: formattedContactName,
                    relationship: formattedRel,
                },
            });
        }
        return await prisma.user.update({
            where: {
                email,
            },
            data: {
                firstName: data.firstName !== undefined ? capitalizeWords(data.firstName) : undefined,
                lastName: data.lastName !== undefined ? capitalizeWords(data.lastName) : undefined,
                password: data.password,
            },
            include: {
                patientProfile: true,
                nonPatientProfile: true,
            },
        });
    }
    async onBoardUser(email) {
        return await prisma.user.update({
            where: {
                email,
            },
            data: {
                onBoarded: true,
            },
        });
    }
    async changePassword(id, newPassword) {
        return await prisma.user.update({
            where: {
                id,
            },
            data: {
                password: newPassword,
            },
        });
    }
}
//# sourceMappingURL=user.repository.js.map