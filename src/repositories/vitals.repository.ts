import { prisma } from "@/lib/prisma";
import { DeviceData } from "@/types/user";

export class VitalsRepository {
  async create(data: DeviceData) {
    return await prisma.vitalReadings.create({ data });
  }

  async get() {
    return await prisma.vitalReadings.findMany();
  }
}