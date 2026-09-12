import { prisma } from "@/lib/prisma";
import { CommandData } from "@/types/user";
import { PaginationParams } from "@/utils/pagination";

export class CommandRepository {
  constructor(private readonly database = prisma) {}

  async findAll(nonPatientId: string, pagination: PaginationParams) {
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

  async findLatest(nonPatientId: string) {
    return await this.database.commands.findFirst({
      where: {
        nonPatientId: nonPatientId,
      },
      orderBy: {
        recordedAt: "desc",
      },
    });
  }

  async create(data: CommandData) {
    return await this.database.commands.create({ data });
  }

  async updateByLatest(
    nonPatientId: string,
    data: Partial<CommandData>,
    patientId?: string,
  ) {
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

  async findRecent(nonPatientId: string) {
    return await this.database.commands.findMany({
      where: {
        nonPatientId: nonPatientId,
      },
      take: 5,
      orderBy: {
        recordedAt: "desc",
      },
    });
  }
}
