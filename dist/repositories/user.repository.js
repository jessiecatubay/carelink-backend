import { prisma } from "../lib/prisma";
export class UserRepository {
    async getById(id) {
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
            select: {
                role: true,
            },
        });
        if (user?.role === "NON_PATIENT") {
            return await prisma.user.findUnique({
                where: {
                    id: id,
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
        else if (user?.role === "PATIENT") {
            return await prisma.user.findUnique({
                where: {
                    id: id,
                },
                include: {
                    patientProfile: true,
                    patientConnections: {
                        where: {
                            status: "CONNECTED",
                        },
                        include: {
                            nonPatient: true,
                        },
                    },
                },
            });
        }
        else {
            return await prisma.user.findUnique({
                where: {
                    id: id,
                },
                include: {
                    patientProfile: true,
                    nonPatientProfile: true,
                },
            });
        }
    }
    async create(data) {
        return await prisma.user.create({ data });
    }
    async findByEmail(email) {
        return await prisma.user.findFirst({ where: { email } });
    }
    async getUserByCode(connectionCode) {
        return await prisma.patientProfile.findUnique({
            where: {
                connectionCode: connectionCode
            },
            select: {
                userId: true
            }
        });
    }
    async update(id, data) {
        return await prisma.user.update({ where: { id }, data });
    }
    async onBoardUser(email) {
        return await prisma.user.update({
            where: { email },
            data: { onBoarded: true },
        });
    }
}
//# sourceMappingURL=user.repository.js.map