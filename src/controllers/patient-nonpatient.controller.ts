import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import {
  ConnectPatientNonpatientService,
  FindConnectedNonpatientService,
} from "@/services/patientNonpatient";
import { Request, Response } from "express";

export class PatientNonpatientController {
  public connect = async (req: Request, res: Response) => {
    const { connectionCode, nonPatientId } = req.body;
    const result = await ConnectPatientNonpatientService(
      nonPatientId,
      connectionCode,
    );

    return res.status(result.code).json(result);
  };

  public findConnectedNonPatientService = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    if (!req.user?.id) return;
    const result = await FindConnectedNonpatientService(req.user.id);

    return res.status(result.code).json(result);
  };
}
