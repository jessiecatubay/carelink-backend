import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import {
  ConnectPatientNonpatientService,
  FindConnectedCaregiversService,
  FindConnectedNonpatientService,
  FindConnectedPatientService,
  PreviewPatientByCodeService,
  UpdatePatientNonpatientService,
} from "@/services/patientNonpatient";
import { Response } from "express";

export class PatientNonpatientController {
  public previewPatient = async (req: AuthenticatedRequest, res: Response) => {
    const { connectionCode } = req.body;
    const result = await PreviewPatientByCodeService(connectionCode);
    return res.status(result.code).json(result);
  };

  public connect = async (req: AuthenticatedRequest, res: Response) => {
    const nonPatientId = req.user?.id || req.body?.nonPatientId;
    const { connectionCode, relationship } = req.body;

    if (!nonPatientId) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Unauthorized. Session required.",
      });
    }

    const result = await ConnectPatientNonpatientService(
      nonPatientId,
      connectionCode,
      relationship,
    );

    return res.status(result.code).json(result);
  };

  public findConnectedPatient = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const nonPatientId = req.user?.id || req.body?.nonPatientId;

    if (!nonPatientId) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Unauthorized. Session required.",
      });
    }

    const result = await FindConnectedPatientService(nonPatientId);

    return res.status(result.code).json(result);
  };

  public findConnectedNonPatient = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const patientId = req.user?.id || req.body?.userId;

    if (!patientId) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Unauthorized. Session required.",
      });
    }

    const result = await FindConnectedNonpatientService(patientId);

    return res.status(result.code).json(result);
  };

  public findConnectedCaregivers = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    const patientId = req.user?.id || req.body?.patientId || req.body?.userId;

    if (!patientId) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Unauthorized. Session required.",
      });
    }

    const result = await FindConnectedCaregiversService(patientId);

    return res.status(result.code).json(result);
  };

  public update = async (req: AuthenticatedRequest, res: Response) => {
    const currentUserId = req.user?.id;
    const { patientId, nonPatientId, ...data } = req.body;

    // Verify current user is either the patient or the caregiver involved
    if (currentUserId && currentUserId !== patientId && currentUserId !== nonPatientId) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: "Forbidden. You cannot modify connections for other users.",
      });
    }

    const result = await UpdatePatientNonpatientService(
      patientId,
      nonPatientId,
      data,
    );

    return res.status(result.code).json(result);
  };
}
