import { prisma } from "@/lib/prisma";
import { PatientNonPatient } from "@/types/user";

export class PatientNonpatientRepository {
  async create(data: PatientNonPatient) {
    return await prisma.patientNonPatient.create({ data });
  }

  async findConnectedNonPatients(patientId: string) {
    return await prisma.patientNonPatient.findMany({
      where: {
        patientId,
        status: "CONNECTED",
        currentPatient: true,
      },
      select: {
        nonPatientId: true,
      },
    });
  }

  async findConnection(patientId: string, nonPatientId: string) {
    return await prisma.patientNonPatient.findFirst({
      where: {
        patientId,
        nonPatientId,
        status: "CONNECTED",
      },
    });
  }

  async update(
    patientId: string,
    nonPatientId: string,
    data: Partial<PatientNonPatient>,
  ) {
    return await prisma.patientNonPatient.update({
      where: {
        patientId_nonPatientId: {
          patientId,
          nonPatientId,
        },
      },
      data,
    });
  }

  async findConnectedPatients(nonPatientId: string) {
    return await prisma.patientNonPatient.findMany({
      where: {
        nonPatientId,
        status: "CONNECTED",
      },
      include: {
        patient: {
          include: {
            patientProfile: true,
          },
        },
      },
    });
  }
}
