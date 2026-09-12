import { prisma } from "@/lib/prisma";
import { CommandData } from "@/types/user";
import { PaginationParams } from "@/utils/pagination";

export class CommandRepository {
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
      prisma.commands.findMany({
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
      prisma.commands.count({
        where: commandWhere,
      }),
    ]);

    return { data, totalItems };
  }

  async findLatest(nonPatientId: string) {
    return await prisma.commands.findFirst({
      where: {
        nonPatientId: nonPatientId,
      },
      orderBy: {
        recordedAt: "desc",
      },
    });
  }

  async create(data: CommandData) {
    return await prisma.commands.create({ data });
  }

  async updateByLatest(nonPatientId: string, data: Partial<CommandData>) {
    const latest = await prisma.commands.findFirst({
      where: {
        nonPatientId,
      },
      orderBy: {
        recordedAt: "desc",
      },
    });

    if (!latest) {
      return null;
    }

    return await prisma.commands.update({
      where: {
        id: latest.id,
      },
      data,
    });
  }

  async findRecent(nonPatientId: string) {
    return await prisma.commands.findMany({
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
