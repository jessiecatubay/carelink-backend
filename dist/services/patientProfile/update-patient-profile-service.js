import { PatientProfileRepository } from "@/repositories/patient-profile.repository";
export async function UpdatePatientProfileService(id, data) {
    const patienProfileRepository = new PatientProfileRepository();
    try {
        await patienProfileRepository.update(id, data);
        return {
            code: 200,
            status: "success",
            message: "Successfully updated patient profile"
        };
    }
    catch (error) {
        return {
            code: 500,
            status: "error",
            message: "Unable to update patient profile"
        };
    }
}
//# sourceMappingURL=update-patient-profile-service.js.map