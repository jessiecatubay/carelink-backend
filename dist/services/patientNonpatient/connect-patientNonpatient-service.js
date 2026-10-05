import { emitConnectionUpdated } from "@/lib/socket";
import { prisma } from "@/lib/prisma";
import { PatientNonpatientRepository } from "@/repositories/patient-nonpatient-repository";
import { UserRepository } from "@/repositories/user.repository";
export async function ConnectPatientNonpatientService(nonPatientId, connectionCode, relationship) {
    const userRepository = new UserRepository();
    const patientNonpatientRepository = new PatientNonpatientRepository();
    try {
        const trimmedCode = (connectionCode || "").trim().toUpperCase();
        if (!trimmedCode) {
            return {
                code: 400,
                status: "error",
                message: "Connection code is required",
            };
        }
        const nonPatient = await userRepository.getById(nonPatientId);
        const patientProfile = await userRepository.getUserByCode(trimmedCode);
        if (!nonPatient) {
            return {
                code: 404,
                status: "error",
                message: "User account not found",
            };
        }
        if (!patientProfile) {
            return {
                code: 404,
                status: "error",
                message: "Invalid connection code. Patient device not found.",
            };
        }
        if (patientProfile.userId === nonPatientId) {
            return {
                code: 400,
                status: "error",
                message: "You cannot connect to your own patient account.",
            };
        }
        // Save or update relationship if provided
        const trimmedRel = (relationship || "").trim();
        if (trimmedRel) {
            await prisma.nonPatientProfile.upsert({
                where: { userId: nonPatientId },
                update: { relationship: trimmedRel },
                create: {
                    userId: nonPatientId,
                    relationship: trimmedRel,
                },
            });
        }
        const existingConnection = await patientNonpatientRepository.findAnyConnection(patientProfile.userId, nonPatientId);
        if (existingConnection) {
            await patientNonpatientRepository.update(patientProfile.userId, nonPatientId, {
                status: "CONNECTED",
                currentPatient: true,
            });
            emitConnectionUpdated(patientProfile.userId, nonPatientId, {
                relationship: trimmedRel,
                patientName: `${patientProfile.user?.firstName || ""} ${patientProfile.user?.lastName || ""}`.trim(),
                nonPatientName: `${nonPatient.firstName || ""} ${nonPatient.lastName || ""}`.trim(),
            });
            return {
                code: 200,
                status: "success",
                message: "Successfully connected to patient",
                data: {
                    patientId: patientProfile.userId,
                },
            };
        }
        await patientNonpatientRepository.create({
            patientId: patientProfile.userId,
            nonPatientId,
            status: "CONNECTED",
            currentPatient: true,
        });
        emitConnectionUpdated(patientProfile.userId, nonPatientId, {
            relationship: trimmedRel,
            patientName: `${patientProfile.user?.firstName || ""} ${patientProfile.user?.lastName || ""}`.trim(),
            nonPatientName: `${nonPatient.firstName || ""} ${nonPatient.lastName || ""}`.trim(),
        });
        return {
            code: 201,
            status: "success",
            message: "Successfully connected to patient",
            data: {
                patientId: patientProfile.userId,
            },
        };
    }
    catch (error) {
        console.error("ConnectPatientNonpatientService error:", error);
        return {
            code: 500,
            status: "error",
            message: error?.message || "Unable to connect patientNonpatient",
        };
    }
}
//# sourceMappingURL=connect-patientNonpatient-service.js.map