import { prisma } from "@/lib/prisma";
export class PatientProfileRepository {
    async update(id, data) {
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
//# sourceMappingURL=patient-profile.repository.js.map