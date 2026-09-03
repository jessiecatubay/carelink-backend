import { prisma } from "@/lib/prisma";
import { RemoteData } from "@/types/user";

export class RemoteRepository {
  async findAll() {
    return await prisma.remote.findMany();
  }

  async create(data: RemoteData) {
    return await prisma.remote.create({data});
  }
}