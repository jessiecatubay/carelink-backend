import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import {
  ConnectPatientNonpatientService,
  FindConnectedNonpatientService,
  UpdatePatientNonpatientService,
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

  public findConnectedNonPatient = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    console.log(req.body);
    const result = await FindConnectedNonpatientService(req.body.userId);

    return res.status(result.code).json(result);
  };

  public update = async (req: Request, res: Response) => {
    const { patientId, nonPatientId, ...data } = req.body;
    console.log(req.body);
    console.log(data);

    const result = await UpdatePatientNonpatientService(patientId, nonPatientId, data);

    return res.status(result.code).json(result);
  }
}
