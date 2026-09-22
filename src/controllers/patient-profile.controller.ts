import { GenerateConnectionCodeService, UpdatePatientProfileService } from "@/services/patientProfile"
import { Request, Response } from "express";
import { RegisterDeviceOwnedService } from "@/services/patientProfile";
import { AuthenticatedRequest } from "@/middlewares/authenticate-token";

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

  public registerDeviceOwned = async (req: AuthenticatedRequest, res: Response) => {
    const { deviceId } = req.body;
    if(!req?.user?.id) return;

    const result = await RegisterDeviceOwnedService(req.user.id, deviceId);

    return res.status(result.code).json(result);
  }
}