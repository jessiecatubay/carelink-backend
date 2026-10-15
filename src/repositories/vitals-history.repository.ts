import { prisma } from "@/lib/prisma";
import { DeviceData } from "@/types/user";
import { PaginationParams } from "@/utils/pagination";
import { VitalReadingsWhereInput } from "@/generated/prisma/models";

export class VitalsRepository {
  constructor(private readonly database = prisma) {}

  async create(data: DeviceData) {
    return await this.database.vitalReadings.create({ data });
  }

  private async buildVitalWhere(
    userId: string,
    targetPatientId?: string,
  ): Promise<VitalReadingsWhereInput | null> {
    let resolvedPatientId = targetPatientId;

    if (resolvedPatientId) {
      // Validate that caller is the patient or is a connected caregiver
      if (resolvedPatientId !== userId) {
        const connection = await this.database.patientNonPatient.findFirst({
          where: {
            nonPatientId: userId,
            patientId: resolvedPatientId,
            status: "CONNECTED",
          },
        });
        if (!connection) {
          return null;
        }
      }
    } else {
      // Check if user is a caregiver with connected patients
      const connections = await this.database.patientNonPatient.findMany({
        where: {
          nonPatientId: userId,
          status: "CONNECTED",
        },
        orderBy: [
          { currentPatient: "desc" },
          { updatedAt: "desc" },
        ],
        select: {
          patientId: true,
          currentPatient: true,
        },
      });

      if (connections.length > 0) {
        resolvedPatientId =
          connections.find((c) => c.currentPatient)?.patientId ||
          connections[0].patientId;
      } else {
        // Fallback: check if user is a patient themselves
        const patientProfile = await this.database.patientProfile.findUnique({
          where: { userId },
          select: { userId: true },
        });

        if (patientProfile) {
          resolvedPatientId = userId;
        } else {
          // Check if any vitals directly exist with patientId: userId
          const count = await this.database.vitalReadings.count({
            where: { patientId: userId },
          });
          if (count > 0) {
            resolvedPatientId = userId;
          } else {
            return null;
          }
        }
      }
    }

    if (!resolvedPatientId) {
      return null;
    }

    // Collect devices owned by this patient or associated via commands
    const deviceIds = new Set<string>();

    const profile = await this.database.patientProfile.findUnique({
      where: { userId: resolvedPatientId },
      select: { deviceOwned: true },
    });
    if (profile?.deviceOwned) {
      deviceIds.add(profile.deviceOwned);
    }

    const commands = await this.database.commands.findMany({
      where: { patientId: resolvedPatientId },
      select: { deviceId: true },
      distinct: ["deviceId"],
    });
    for (const cmd of commands) {
      if (cmd.deviceId) {
        deviceIds.add(cmd.deviceId);
      }
    }

    const orConditions: VitalReadingsWhereInput[] = [
      { patientId: resolvedPatientId },
    ];

    if (deviceIds.size > 0) {
      orConditions.push({ deviceId: { in: Array.from(deviceIds) } });
    }

    return { OR: orConditions };
  }

  async get(
    userId: string,
    pagination: PaginationParams,
    targetPatientId?: string,
  ) {
    const vitalWhere = await this.buildVitalWhere(userId, targetPatientId);

    if (!vitalWhere) {
      return { data: [], totalItems: 0 };
    }

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
          patientId: true,
          heartRate: true,
          temperature: true,
          batteryLevel: true,
          batteryVoltage: true,
          sensorContact: true,
          recordedAt: true,
        },
      }),
      this.database.vitalReadings.count({ where: vitalWhere }),
    ]);

    return { data, totalItems };
  }

  async getRecent(userId: string, targetPatientId?: string) {
    const vitalWhere = await this.buildVitalWhere(userId, targetPatientId);

    if (!vitalWhere) {
      return [];
    }

    return await this.database.vitalReadings.findMany({
      where: vitalWhere,
      take: 8,
      orderBy: {
        recordedAt: "desc",
      },
      select: {
        id: true,
        deviceId: true,
        patientId: true,
        temperature: true,
        heartRate: true,
        batteryLevel: true,
        batteryVoltage: true,
        sensorContact: true,
        recordedAt: true,
      },
    });
  }
}
