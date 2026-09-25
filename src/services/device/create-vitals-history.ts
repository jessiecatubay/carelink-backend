import { VitalsRepository } from "@/repositories/vitals-history.repository";
import { DeviceData } from "@/types/user";

export async function CreateVitalsHistoryService(
  deviceId: string,
  temperature: number,
  heartRate: number,
  sensorContact: boolean
) {
  const vitalsRespository = new VitalsRepository();

  try {
    await vitalsRespository.create({ deviceId, temperature, heartRate, sensorContact });

    return {
      code: 200,
      status: "success",
      message: "Successfully created vitals",
    };
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to create vitals",
    };
  }
}
