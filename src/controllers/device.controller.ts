import { DeviceData } from "@/types/user";
import { Request, Response } from "express";
import { getSocket } from "@/lib/socket";

export class DeviceController {
  public patientVitals(req: Request, res: Response) {
    const vitals = req.body as DeviceData;
    const receivedAt = new Date().toISOString();

    console.log("Received device vitals:", vitals, "receivedAt", receivedAt);

    const payload = {
      ...vitals,
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
  }
}
