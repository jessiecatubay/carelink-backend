import { prisma } from "@/lib/prisma";
export class PatientNonpatientRepository {
    async create(data) {
        return await prisma.patientNonPatient.create({ data });
    }
    async findConnectedNonPatients(patientId) {
        return await prisma.patientNonPatient.findMany({
            where: {
                patientId,
                status: "CONNECTED",
                currentPatient: true
            },
            select: {
                nonPatientId: true,
            },
        });
    }
    async findConnection(patientId, nonPatientId) {
        return await prisma.patientNonPatient.findFirst({
            where: {
                patientId,
                nonPatientId,
                status: "CONNECTED",
            },
        });
    }
    async update(patientId, nonPatientId, data) {
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
}
//# sourceMappingURL=patient-nonpatient-repository.js.map