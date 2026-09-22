import { prisma } from "../lib/prisma";
import { EmergencyContactData } from "@/types/emergency-contact";

export class EmergencyContactRepository {
  async getById(id: string) {
    return await prisma.emergencyContact.findUnique({
      where: { id },
      include: {
        patientProfile: true,
      },
    });
  }

  async getByPatientProfileId(patientProfileId: string) {
    return await prisma.emergencyContact.findMany({
      where: { patientProfileId },
      orderBy: {
        isPriority: "desc", // Priority contacts appear first
      },
    });
  }

  async create(data: EmergencyContactData) {
    return await prisma.emergencyContact.create({
      data,
    });
  }

  async update(id: string, data: Partial<EmergencyContactData>) {
    return await prisma.emergencyContact.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.emergencyContact.delete({
      where: { id },
    });
  }
}