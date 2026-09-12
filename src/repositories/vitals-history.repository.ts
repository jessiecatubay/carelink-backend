import { prisma } from "@/lib/prisma";
import { DeviceData } from "@/types/user";
import { PaginationParams } from "@/utils/pagination";

export class VitalsRepository {
  constructor(private readonly database = prisma) {}

  async create(data: DeviceData) {
    return await this.database.vitalReadings.create({ data });
  }

  async get(nonPatientId: string, pagination: PaginationParams) {
    const commandWhere = {
      nonPatientId,
      patient: {
        patientConnections: {
          some: {
            nonPatientId,
            status: "CONNECTED" as const,
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
      .filter((deviceId): deviceId is string => deviceId !== null);
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

  async getRecent(nonPatientId: string) {
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
      .filter((deviceId): deviceId is string => deviceId !== null);

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
