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
                currentPatient: true,
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
    async findAnyConnection(patientId, nonPatientId) {
        return await prisma.patientNonPatient.findUnique({
            where: {
                patientId_nonPatientId: {
                    patientId,
                    nonPatientId,
                },
            },
        });
    }
    async upsertConnection(patientId, nonPatientId, data) {
        return await prisma.patientNonPatient.upsert({
            where: {
                patientId_nonPatientId: {
                    patientId,
                    nonPatientId,
                },
            },
            update: {
                status: data.status,
                currentPatient: data.currentPatient ?? true,
            },
            create: {
                patientId,
                nonPatientId,
                status: data.status,
                currentPatient: data.currentPatient ?? true,
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
    async findConnectedPatients(nonPatientId) {
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
//# sourceMappingURL=patient-nonpatient-repository.js.map