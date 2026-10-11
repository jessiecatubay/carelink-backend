import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import {
  CreatePillReminderService,
  DeletePillReminderService,
  ListPillRemindersService,
  UpdatePillReminderService,
} from "@/services/pill-reminder.service";

export class PillReminderController {
  public create = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Authentication required",
      });
    }

    const result = await CreatePillReminderService(req.user.id, req.body);
    return res.status(result.code).json(result);
  };

  public list = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Authentication required",
      });
    }

    const patientId =
      typeof req.query.patientId === "string" ? req.query.patientId : "";
    const result = await ListPillRemindersService(req.user.id, patientId);
    return res.status(result.code).json(result);
  };

  public update = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Authentication required",
      });
    }

    const reminderId =
      typeof req.params.id === "string"
        ? req.params.id
        : typeof req.body.id === "string"
          ? req.body.id
          : "";
    const result = await UpdatePillReminderService(
      req.user.id,
      reminderId,
      req.body,
    );
    return res.status(result.code).json(result);
  };

  public delete = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Authentication required",
      });
    }

    const reminderId =
      typeof req.params.id === "string"
        ? req.params.id
        : typeof req.body.id === "string"
          ? req.body.id
          : typeof req.query.id === "string"
            ? req.query.id
            : "";
    const result = await DeletePillReminderService(req.user.id, reminderId);
    return res.status(result.code).json(result);
  };
}
