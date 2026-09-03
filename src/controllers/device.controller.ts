import { DeviceData } from "@/types/user";
import { Request, Response } from "express";
import { getSocket } from "@/lib/socket";
import {
  GetVitalsHistoryService,
  CreateVitalsHistoryService,
  GetRecentVitalsHistoryService
} from "@/services/device";
import { SendDeviceCommand } from "@/services/mqtt.service";
import { CreateCommandService } from "@/services/remote";

export class DeviceController {
  public patientVitals = async (req: Request, res: Response) => {
    const { deviceId, temperature, heartRate, sensorContact } = req.body as DeviceData;
    const receivedAt = new Date().toISOString();

    console.log("Received device vitals:", { deviceId, temperature, heartRate, sensorContact }, "receivedAt", receivedAt);

    await CreateVitalsHistoryService(deviceId, temperature, heartRate, sensorContact);

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

  public command = async (req: Request, res: Response) => {
    const { deviceId, command } = req.body;
    console.log(deviceId);
    console.log(command);

    const result = SendDeviceCommand(deviceId, command);
    await CreateCommandService(deviceId, command);

    return res.status(200).json(result);
  }
}
