import { prisma } from "@/lib/prisma";
import { PatientNonPatient } from "@/types/user";

export class PatientNonpatientRepository {
  async create(data: PatientNonPatient) {
    return await prisma.patientNonPatient.create({ data });
  }
}
