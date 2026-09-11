import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import { ConnectPatientNonpatientService, FindConnectedNonpatientService } from "@/services/patientNonpatient";
import { Request, Response } from "express";

export class PatientNonpatientController {
  public connect = async (req: Request, res: Response) => {
    const { connectionCode, nonPatientId } = req.body;
    console.log(req.body);

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
    console.log("asldkflak",req!.user!.id);
    const result = await FindConnectedNonpatientService("998cfc14-2c5c-46dc-9d78-b691bffb7ee7");

    return res.status(result.code).json(result);
  };
}
