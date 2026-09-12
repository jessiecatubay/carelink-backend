import { prisma } from "@/lib/prisma";
import { DeviceData } from "@/types/user";
import { PaginationParams } from "@/utils/pagination";

export class VitalsRepository {
  async create(data: DeviceData) {
    return await prisma.vitalReadings.create({ data });
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
    const accessibleCommands = await prisma.commands.findMany({
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
      prisma.vitalReadings.findMany({
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
      prisma.vitalReadings.count({ where: vitalWhere }),
    ]);

    return { data, totalItems };
  }

  async getRecent() {
    return await prisma.vitalReadings.findMany({
      take: 5,
      orderBy: {
        recordedAt: "desc",
      },
    });
  }
}
