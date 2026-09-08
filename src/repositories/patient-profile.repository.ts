import { prisma } from "@/lib/prisma";
import { PatientProfile } from "@/types/user";

export class PatientProfileRepository {
  async update(id: string, data: Partial<PatientProfile>) {
  return await prisma.user.update({
    where: { id },
    data: {
      patientProfile: {
        update: data,
      },
    },
  });
}
}
