import { VitalsRepository } from "@/repositories/vitals-history.repository";
export async function CreateVitalsHistoryService(deviceId, temperature, heartRate, sensorContact) {
    const vitalsRespository = new VitalsRepository();
    try {
        await vitalsRespository.create({ deviceId, temperature, heartRate, sensorContact });
        return {
            code: 200,
            status: "success",
            message: "Successfully created vitals",
        };
    }
    catch (error) {
        return {
            code: 500,
            status: "error",
            message: "Unable to create vitals",
        };
    }
}
//# sourceMappingURL=create-vitals-history.js.map