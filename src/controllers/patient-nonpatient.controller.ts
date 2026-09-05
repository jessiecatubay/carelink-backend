import { ConnectPatientNonpatientService } from "@/services/patientNonpatient";
import { Request, Response } from "express";

export class PatientNonpatientController {
  public connect = async (req: Request, res: Response) => {
    const { connectionId, nonPatientId } = req.body;

    const result = await ConnectPatientNonpatientService(nonPatientId, connectionId);

    return res.status(result.code).json(result);
  }
}