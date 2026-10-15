import {
  GenerateConnectionCodeService,
  UpdatePatientProfileService,
  RegisterDeviceOwnedService,
  RemoveDeviceOwnedService,
} from "@/services/patientProfile";
import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import { Request, Response } from "express";

export class UpdatePatientProfileController {
  public update = async (req: Request, res: Response) => {
    const { patientId, ...data } = req.body;

    const result = await UpdatePatientProfileService(patientId, data);

    return res.status(result.code).json(result);
  };

  public generateConnectionCode = async (req: Request, res: Response) => {
    const { id } = req.body;

    const result = await GenerateConnectionCodeService(id);

    return res.status(result.code).json(result);
  };

  public registerDeviceOwned = async (req: AuthenticatedRequest, res: Response) => {
    const { deviceId, patientId } = req.body;
    const targetUserId =
      (req.user?.role === "PATIENT" ? req.user.id : patientId) || req.user?.id;

    if (!targetUserId) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Unauthorized. User ID not found.",
      });
    }

    const result = await RegisterDeviceOwnedService(targetUserId, deviceId);

    return res.status(result.code).json(result);
  };

  public removeDeviceOwned = async (req: AuthenticatedRequest, res: Response) => {
    const { patientId } = req.body || {};
    const targetUserId =
      (req.user?.role === "PATIENT" ? req.user.id : patientId) || req.user?.id;

    if (!targetUserId) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Unauthorized. User ID not found.",
      });
    }

    const result = await RemoveDeviceOwnedService(targetUserId);

    return res.status(result.code).json(result);
  };
}