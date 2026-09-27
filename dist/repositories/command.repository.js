import { prisma } from "@/lib/prisma";
export class CommandRepository {
    database;
    constructor(database = prisma) {
        this.database = database;
    }
    async findAll(nonPatientId, pagination) {
        const commandWhere = {
            nonPatientId,
            patient: {
                patientConnections: {
                    some: {
                        nonPatientId,
                        status: "CONNECTED",
                    },
                },
            },
        };
        const [data, totalItems] = await Promise.all([
            this.database.commands.findMany({
                where: commandWhere,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: {
                    recordedAt: "desc",
                },
                select: {
                    id: true,
                    command: true,
                    status: true,
                    recordedAt: true,
                },
            }),
            this.database.commands.count({
                where: commandWhere,
            }),
        ]);
        return { data, totalItems };
    }
    async findLatest(nonPatientId, patientId) {
        return await this.database.commands.findFirst({
            where: {
                nonPatientId: nonPatientId,
                patientId: patientId
            },
            orderBy: {
                recordedAt: "desc",
            },
        });
    }
    async create(data) {
        return await this.database.commands.create({ data });
    }
    async updateByLatest(nonPatientId, data, patientId) {
        const latest = await this.database.commands.findFirst({
            where: {
                nonPatientId,
                ...(patientId ? { patientId } : {}),
            },
            orderBy: {
                recordedAt: "desc",
            },
        });
        if (!latest) {
            return null;
        }
        return await this.database.commands.update({
            where: {
                id: latest.id,
            },
            data,
        });
    }
    async findRecent(nonPatientId, patientId) {
        return await this.database.commands.findMany({
            where: {
                nonPatientId: nonPatientId,
                patientId: patientId,
            },
            take: 5,
            orderBy: {
                recordedAt: "desc",
            },
        });
    }
}
//# sourceMappingURL=command.repository.js.map