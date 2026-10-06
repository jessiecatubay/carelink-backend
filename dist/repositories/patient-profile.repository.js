import { prisma } from "../lib/prisma.js";
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
    async getUserByDeviceId(deviceId) {
        return await prisma.patientProfile.findUnique({
            where: {
                deviceOwned: deviceId,
            },
            select: {
                userId: true,
            }
        });
    }
}
//# sourceMappingURL=patient-profile.repository.js.map