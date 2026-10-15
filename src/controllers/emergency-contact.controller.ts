import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import { prisma } from "@/lib/prisma";
import {
  CreateEmergencyContactService,
  DeleteEmergencyContactService,
  GetEmergencyContactByIdService,
  GetEmergencyContactsByPatientProfileIdService,
  UpdateEmergencyContactService,
} from "@/services/emergencyContact";

export class EmergencyContactController {
  public getById = async (req: Request, res: Response) => {
    const id = req.body?.id || (req.query?.id as string) || req.params?.id;

    if (!id) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Emergency contact ID is required",
      });
    }

    const result = await GetEmergencyContactByIdService(id);

    return res.status(result.code).json(result);
  };

  public getByPatientProfileId = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    let patientProfileId =
      req.body?.patientProfileId ||
      (req.query?.patientProfileId as string) ||
      (authReq.user?.role === "PATIENT" ? authReq.user.id : undefined);

    // If non-patient didn't supply patientProfileId, resolve their active connected patient
    if (!patientProfileId && authReq.user?.id) {
      const conn = await prisma.patientNonPatient.findFirst({
        where: {
          nonPatientId: authReq.user.id,
          status: "CONNECTED",
        },
        orderBy: [{ currentPatient: "desc" }, { createdAt: "desc" }],
      });
      if (conn) {
        patientProfileId = conn.patientId;
      }
    }

    if (!patientProfileId) {
      return res.status(200).json({
        code: 200,
        status: "success",
        message: "No patient profile found",
        data: [],
      });
    }

    const result = await GetEmergencyContactsByPatientProfileIdService(
      String(patientProfileId),
    );

    return res.status(result.code).json(result);
  };

  public create = async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const data = { ...req.body };

    if (!data.patientProfileId) {
      if (authReq.user?.role === "PATIENT") {
        data.patientProfileId = authReq.user.id;
      } else if (authReq.user?.id) {
        const conn = await prisma.patientNonPatient.findFirst({
          where: {
            nonPatientId: authReq.user.id,
            status: "CONNECTED",
          },
          orderBy: [{ currentPatient: "desc" }, { createdAt: "desc" }],
        });
        if (conn) {
          data.patientProfileId = conn.patientId;
        }
      }
    }

    if (!data.patientProfileId) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "patientProfileId is required to create an emergency contact",
      });
    }

    const result = await CreateEmergencyContactService(data);

    return res.status(result.code).json(result);
  };

  public update = async (req: Request, res: Response) => {
    const { id, data, ...rest } = req.body;
    const contactId = id || (req.query?.id as string) || req.params?.id;
    const updateData = data && typeof data === "object" ? data : rest;

    if (!contactId) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Emergency contact ID is required",
      });
    }

    const result = await UpdateEmergencyContactService(contactId, updateData);

    return res.status(result.code).json(result);
  };

  public delete = async (req: Request, res: Response) => {
    const id = req.body?.id || (req.query?.id as string) || req.params?.id;

    if (!id) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Emergency contact ID is required",
      });
    }

    const result = await DeleteEmergencyContactService(id);

    return res.status(result.code).json(result);
  };
}