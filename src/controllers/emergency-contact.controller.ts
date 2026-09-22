import { Request, Response } from "express";
import {
  CreateEmergencyContactService,
  DeleteEmergencyContactService,
  GetEmergencyContactByIdService,
  GetEmergencyContactsByPatientProfileIdService,
  UpdateEmergencyContactService,
} from "@/services/emergencyContact";

export class EmergencyContactController {
  public getById = async (req: Request, res: Response) => {
    const { id } = req.body;

    const result = await GetEmergencyContactByIdService(id);

    return res.status(result.code).json(result);
  };

  public getByPatientProfileId = async (req: Request, res: Response) => {
    const { patientProfileId } = req.body;
    console.log(patientProfileId);

    const result = await GetEmergencyContactsByPatientProfileIdService(patientProfileId);

    return res.status(result.code).json(result);
  };

  public create = async (req: Request, res: Response) => {
    const data = req.body;
    console.log("karun nga data", data);

    const result = await CreateEmergencyContactService(data);

    return res.status(result.code).json(result);
  };

  public update = async (req: Request, res: Response) => {
    const { id, data } = req.body;

    const result = await UpdateEmergencyContactService(id, data);

    return res.status(result.code).json(result);
  };

  public delete = async (req: Request, res: Response) => {
    const { id } = req.body;

    const result = await DeleteEmergencyContactService(id);

    return res.status(result.code).json(result);
  };
}