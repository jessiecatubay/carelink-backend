import { DeviceData } from "@/types/user";
import { Request, Response } from "express";

export class DeviceController {
  public patientVitals (req: Request, res: Response) {
    console.log(req.body);
  }
}