import { PatientNonpatientRepository } from "@/repositories/patient-nonpatient-repository";
export async function CreatePatientNonpatientService(data) {
    const patientNonpatientRepository = new PatientNonpatientRepository();
    try {
        await patientNonpatientRepository.create(data);
        return {
            code: 201,
            status: "success",
            message: "Successfully created patientNonpatient"
        };
    }
    catch (error) {
        return {
            code: 500,
            status: "error",
            message: "Unable to create patientNonpatient"
        };
    }
}
//# sourceMappingURL=create-patientNonpatient-service.js.map