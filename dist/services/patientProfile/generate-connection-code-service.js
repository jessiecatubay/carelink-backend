import { PatientProfileRepository } from "../../repositories/patient-profile.repository.js";
import { generateCode } from "../../utils/generateConnectionCode.js";
export async function GenerateConnectionCodeService(id) {
    const patientProfileRepository = new PatientProfileRepository();
    try {
        const code = generateCode();
        await patientProfileRepository.update(id, { connectionCode: code });
        return {
            code: 200,
            status: "success",
            message: "Successfully generated connection code",
            data: {
                generatedCode: code
            }
        };
    }
    catch (error) {
        return {
            code: 500,
            status: "error",
            message: "Unable to generate connection code"
        };
    }
}
//# sourceMappingURL=generate-connection-code-service.js.map