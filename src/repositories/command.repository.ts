import { prisma } from "@/lib/prisma";
import { CommandData } from "@/types/user";

export class CommandRepository {
  async findAll(nonPatientId: string) {
    return await prisma.commands.findMany({
      where: {
        nonPatientId: nonPatientId
      }
    });
  }

  async findLatest(nonPatientId: string) {
    return await prisma.commands.findFirst({
      where: {
        nonPatientId: nonPatientId,
      },
      orderBy: {
        recordedAt: 'desc'
      }
    });
  }

  async create(data: CommandData) {
    return await prisma.commands.create({data});
  }

  async updateByLatest(data: Partial<CommandData>) {
    const latest = await prisma.commands.findFirst({
      where: {
        patientId: data.patientId,
      },
      orderBy: {
        recordedAt: 'desc',
      }
    })

    return await prisma.commands.update({
      where: {
        id: latest?.id
      },
      data
    })
  }

  async findRecent(nonPatientId: string) {
    return await prisma.commands.findMany({
      where: {
        nonPatientId: nonPatientId,
      },
      take: 5,
      orderBy: {
        recordedAt: 'desc'
      }
    })
  }
}