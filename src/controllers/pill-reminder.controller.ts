import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import {
  CreatePillReminderService,
  ListPillRemindersService,
} from "@/services/pill-reminder.service";

export class PillReminderController {
  public create = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({
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
      return res
        .status(401)
        .json({
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
}
