import { DeviceData } from "@/types/user";
import { Request, Response } from "express";
import { getSocket } from "@/lib/socket";
import {
  GetVitalsHistoryService,
  CreateVitalsHistoryService,
  GetRecentVitalsHistoryService
} from "@/services/device";

export class DeviceController {
  public patientVitals = async (req: Request, res: Response) => {
    const { deviceId, temperature, heartRate } = req.body as DeviceData;
    const receivedAt = new Date().toISOString();

    console.log("Received device vitals:", { deviceId, temperature, heartRate }, "receivedAt", receivedAt);

    await CreateVitalsHistoryService(deviceId, temperature, heartRate);

    const payload = {
      ...{ deviceId, temperature, heartRate },
      receivedAt,
    };

    try {
      const io = getSocket();
      io.emit("patientVitals", payload);
    } catch (error) {
      console.error("Socket not initialized:", error);
    }

    return res.status(200).json({
      success: true,
      message: "Vitals received",
      data: payload,
    });
  };

  public getFullPatientVitals = async (req: Request, res: Response) => {
    const result = await GetVitalsHistoryService();

    return res.status(result.code).json(result);
  }

  public getRecentPatientVitals = async (req: Request, res: Response) => {
    const result = await GetRecentVitalsHistoryService();

    return res.status(result.code).json(result);
  }
}
