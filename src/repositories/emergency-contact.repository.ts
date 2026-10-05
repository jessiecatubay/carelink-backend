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
      orderBy: {
        isPriority: "desc", // Priority contacts appear first
      },
    });
  }

  async create(data: EmergencyContactData) {
    return await prisma.emergencyContact.create({
      data: {
        ...data,
        name: data.name ? capitalizeWords(data.name) : data.name,
        relationship: data.relationship ? capitalizeWords(data.relationship) : data.relationship,
      },
    });
  }

  async update(id: string, data: Partial<EmergencyContactData>) {
    return await prisma.emergencyContact.update({
      where: { id },
      data: {
        ...data,
        name: data.name !== undefined ? capitalizeWords(data.name) : undefined,
        relationship: data.relationship !== undefined ? capitalizeWords(data.relationship) : undefined,
      },
    });
  }

  async delete(id: string) {
    return await prisma.emergencyContact.delete({
      where: { id },
    });
  }
}