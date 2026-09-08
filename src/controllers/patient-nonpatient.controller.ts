import { ConnectPatientNonpatientService } from "@/services/patientNonpatient";
import { Request, Response } from "express";

export class PatientNonpatientController {
  public connect = async (req: Request, res: Response) => {
    const { connectionCode, nonPatientId } = req.body;
    console.log(req.body);

    const result = await ConnectPatientNonpatientService(nonPatientId, connectionCode);

    return res.status(result.code).json(result);
  }
}