import { prisma } from "@/lib/prisma";
import { CommandData } from "@/types/user";

export class CommandRepository {
  async findAll() {
    return await prisma.commands.findMany();
  }

  async findLatest() {
    return await prisma.commands.findFirst({
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

  async findRecent() {
    return await prisma.commands.findMany({
      take: 5,
      orderBy: {
        recordedAt: 'desc'
      }
    })
  }
}