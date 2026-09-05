import { GenerateConnectionCodeService, UpdatePatientProfileService } from "@/services/patientProfile"
import { Request, Response } from "express"

export class UpdatePatientProfileController {
  public update = async (req: Request, res: Response) => {
    const { patientId, ...data } = req.body;

    const result = await UpdatePatientProfileService(patientId, data);

    return res.status(result.code).json(result);
  }

  public generateConnectionCode = async (req: Request, res: Response) => {
    const { id } = req.body;

    const result = await GenerateConnectionCodeService(id);

    return res.status(result.code).json(result);
  }
}