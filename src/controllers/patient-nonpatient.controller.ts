import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import {
  ConnectPatientNonpatientService,
  FindConnectedCaregiversService,
  FindConnectedNonpatientService,
  FindConnectedPatientService,
  PreviewPatientByCodeService,
  UpdatePatientNonpatientService,
} from "@/services/patientNonpatient";
import { Request, Response } from "express";

export class PatientNonpatientController {
  public previewPatient = async (req: Request, res: Response) => {
    const { connectionCode } = req.body;
    const result = await PreviewPatientByCodeService(connectionCode);
    return res.status(result.code).json(result);
  };

  public connect = async (req: Request, res: Response) => {
    const { connectionCode, nonPatientId, relationship } = req.body;
    const result = await ConnectPatientNonpatientService(
      nonPatientId,
      connectionCode,
      relationship,
    );

    return res.status(result.code).json(result);
  };

  public findConnectedPatient = async (
    req: Request,
    res: Response,
  ) => {
    const { nonPatientId } = req.body;
    console.log("fafoaijwefoinasdlkfas", req.body);
    const result = await FindConnectedPatientService(nonPatientId);

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

  public findConnectedCaregivers = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const patientId = req.body.patientId || req.body.userId || req.user?.id;
    const result = await FindConnectedCaregiversService(patientId);

    return res.status(result.code).json(result);
  };

  public update = async (req: Request, res: Response) => {
    const { patientId, nonPatientId, ...data } = req.body;
    console.log(req.body);
    console.log(data);

    const result = await UpdatePatientNonpatientService(
      patientId,
      nonPatientId,
      data,
    );

    return res.status(result.code).json(result);
  };
}
