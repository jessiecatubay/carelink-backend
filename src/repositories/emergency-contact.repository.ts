import { prisma } from "../lib/prisma";
import { EmergencyContactData } from "@/types/emergency-contact";
import { capitalizeWords } from "@/utils/string";

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
      orderBy: [{ isPriority: "desc" }, { createdAt: "desc" }],
    });
  }

  async create(data: EmergencyContactData) {
    // Ensure patientProfile exists to satisfy foreign key constraint
    await prisma.patientProfile.upsert({
      where: { userId: data.patientProfileId },
      update: {},
      create: { userId: data.patientProfileId },
    });

    if (data.isPriority) {
      await prisma.emergencyContact.updateMany({
        where: { patientProfileId: data.patientProfileId },
        data: { isPriority: false },
      });
    }

    return await prisma.emergencyContact.create({
      data: {
        name: data.name ? capitalizeWords(data.name) : data.name,
        relationship: data.relationship ? capitalizeWords(data.relationship) : data.relationship,
        phoneNumber: data.phoneNumber,
        isPriority: Boolean(data.isPriority),
        patientProfileId: data.patientProfileId,
      },
    });
  }

  async update(id: string, data: Partial<EmergencyContactData>) {
    if (data.isPriority) {
      const existing = await prisma.emergencyContact.findUnique({
        where: { id },
        select: { patientProfileId: true },
      });
      if (existing) {
        await prisma.emergencyContact.updateMany({
          where: { patientProfileId: existing.patientProfileId },
          data: { isPriority: false },
        });
      }
    }

    return await prisma.emergencyContact.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: capitalizeWords(data.name) } : {}),
        ...(data.relationship !== undefined ? { relationship: capitalizeWords(data.relationship) } : {}),
        ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),
        ...(data.isPriority !== undefined ? { isPriority: Boolean(data.isPriority) } : {}),
      },
    });
  }

  async delete(id: string) {
    return await prisma.emergencyContact.delete({
      where: { id },
    });
  }
}