import { prisma } from "@/lib/prisma";
export class VitalsRepository {
    database;
    constructor(database = prisma) {
        this.database = database;
    }
    async create(data) {
        return await this.database.vitalReadings.create({ data });
    }
    async get(nonPatientId, pagination) {
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
        const accessibleCommands = await this.database.commands.findMany({
            where: commandWhere,
            select: { deviceId: true },
            distinct: ["deviceId"],
        });
        const deviceIds = accessibleCommands
            .map(({ deviceId }) => deviceId)
            .filter((deviceId) => deviceId !== null);
        const vitalWhere = {
            deviceId: { in: deviceIds },
        };
        const [data, totalItems] = await Promise.all([
            this.database.vitalReadings.findMany({
                where: vitalWhere,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: {
                    recordedAt: "desc",
                },
                select: {
                    id: true,
                    deviceId: true,
                    heartRate: true,
                    temperature: true,
                    sensorContact: true,
                    recordedAt: true,
                },
            }),
            this.database.vitalReadings.count({ where: vitalWhere }),
        ]);
        return { data, totalItems };
    }
    async getRecent(nonPatientId) {
        const accessibleCommands = await this.database.commands.findMany({
            where: {
                nonPatientId,
                patient: {
                    patientConnections: {
                        some: { nonPatientId, status: "CONNECTED" },
                    },
                },
            },
            select: { deviceId: true },
            distinct: ["deviceId"],
        });
        const deviceIds = accessibleCommands
            .map(({ deviceId }) => deviceId)
            .filter((deviceId) => deviceId !== null);
        return await this.database.vitalReadings.findMany({
            where: { deviceId: { in: deviceIds } },
            take: 5,
            orderBy: {
                recordedAt: "desc",
            },
            select: {
                id: true,
                deviceId: true,
                temperature: true,
                heartRate: true,
                sensorContact: true,
                recordedAt: true,
            },
        });
    }
}
//# sourceMappingURL=vitals-history.repository.js.map